/**
 * Service de synchronisation entre l'application et un Google Sheets.
 *
 * Principe : l'application envoie les relevés par requête POST vers un Google
 * Apps Script déployé en "Application Web" (voir google-apps-script/Code.gs).
 * Le script écrit les lignes dans l'onglet ODS_Releves et régénère
 * l'onglet ODS_Export au format obs-saisons.fr.
 *
 * Aucune clé Google, aucun OAuth : seul le lien "/exec" du script est requis.
 */

import { Observation } from '../types';
import { ODS_SPECIES, UBELKA_TREES } from '../data';

/* -------------------------------------------------------------------------- */
/*  Colonnes de l'onglet ODS_Releves (ordre identique à Code.gs)              */
/* -------------------------------------------------------------------------- */
export const RELEVE_COLUMNS = [
  'ID_OBSERVATION',
  'DATE',
  'SAISON',
  'TYPE_FICHE',
  'GROUPE',
  'ESPECE',
  'NOM_LATIN',
  'STATION',
  'ZONE',
  'FEUILLAISON_DEBUT',
  'FEUILLAISON_PLEIN',
  'FLORAISON_DEBUT',
  'FLORAISON_PLEIN',
  'FRUCTIFICATION_DEBUT',
  'FRUCTIFICATION_PLEIN',
  'SENESCENCE_DEBUT',
  'SENESCENCE_PLEIN',
  'PREMIER_EVENEMENT',
  'EFFECTIF',
  'COMPLEMENT',
  'METEO',
  'TEMPERATURE',
  'NIVEAU_HUVEAUNE',
  'CONFIANCE',
  'REMARQUES',
  'PHOTOS',
  'ENVOYE_LE',
  'SOURCE'
] as const;

export const FORMAT_VERSION = 'ods-ubelka-v1';

export interface OdsSheetsConfig {
  /** URL "/exec" du Google Apps Script déployé en application web */
  scriptUrl: string;
  /** Jeton partagé avec le script (doit correspondre à CONFIG.TOKEN) */
  token: string;
  /** Onglet recevant les relevés bruts */
  sheetName: string;
  /** Onglet régénéré au format ODS */
  exportSheetName: string;
  /** Nom de la station transmis à l'ODS */
  station: string;
  /** Envoi automatique dès qu'une fiche est enregistrée */
  autoSync: boolean;
  /** Lien d'ouverture du tableur (facultatif, confort) */
  sheetUrl: string;
}

export interface SyncResult {
  ok: boolean;
  message: string;
  added?: number;
  updated?: number;
  ignored?: number;
  total?: number;
  exportRows?: number;
  /** true si Google n'a pas permis de lire la réponse (CORS opaque) */
  optimistic?: boolean;
}

const CONFIG_KEY = 'ubelka_ods_sheets_config_v1';
const DEFAULT_STATION = "Collège Ubelka - Auriol (Ripisylve de l'Huveaune)";

/** Valeurs par défaut : peuvent être pré-remplies via les variables d'environnement. */
export const DEFAULT_CONFIG: OdsSheetsConfig = {
  scriptUrl: (import.meta.env.VITE_ODS_SCRIPT_URL as string) || '',
  token: (import.meta.env.VITE_ODS_SYNC_TOKEN as string) || 'ubelka-ods-2027',
  sheetName: (import.meta.env.VITE_ODS_SHEET_NAME as string) || 'ODS_Releves',
  exportSheetName: (import.meta.env.VITE_ODS_EXPORT_SHEET as string) || 'ODS_Export',
  station: (import.meta.env.VITE_ODS_STATION as string) || DEFAULT_STATION,
  autoSync: (import.meta.env.VITE_ODS_AUTO_SYNC as string) === 'true',
  sheetUrl: (import.meta.env.VITE_ODS_SHEET_URL as string) || ''
};

export function loadSheetsConfig(): OdsSheetsConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as Partial<OdsSheetsConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveSheetsConfig(config: OdsSheetsConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function isSheetsConfigured(config: OdsSheetsConfig): boolean {
  return typeof config.scriptUrl === 'string' && config.scriptUrl.trim().startsWith('https://script.google.com/');
}

/* -------------------------------------------------------------------------- */
/*  Construction de la ligne                                                  */
/* -------------------------------------------------------------------------- */

const ouiNon = (value?: boolean | null): string => (value ? 'Oui' : 'Non');
const safe = (value?: string | number | null): string =>
  value === undefined || value === null ? '' : String(value).replace(/\r?\n/g, ' ').trim();

const FICHE_LABEL: Record<Observation['ficheType'], string> = {
  ligneuse: 'Ligneuse',
  herbacee: 'Herbacée',
  animale: 'Animale'
};

function resolveLatinName(obs: Observation): string {
  const byId = ODS_SPECIES.find(s => s.id === obs.speciesId);
  if (byId) return byId.latinName;
  const byName = ODS_SPECIES.find(
    s => s.commonName.toLowerCase() === (obs.speciesName || '').toLowerCase()
  );
  return byName ? byName.latinName : '';
}

function resolveZone(obs: Observation): string {
  if (obs.ficheType === 'ligneuse') {
    const tree = UBELKA_TREES.find(t => t.id === obs.treeId);
    return tree ? tree.label : 'Ripisylve des méandres';
  }
  if (obs.ficheType === 'herbacee') return safe(obs.herbaceeZone) || 'Zone de 20 m²';
  return safe(obs.animaleZone) || 'Périmètre de 3 km²';
}

/** Convertit une observation en ligne compatible avec l'onglet ODS_Releves. */
export function buildReleveRow(obs: Observation, config: OdsSheetsConfig): (string | number)[] {
  const isLigneuse = obs.ficheType === 'ligneuse';
  const isHerbacee = obs.ficheType === 'herbacee';

  const premierEvenement = isLigneuse
    ? ''
    : isHerbacee
    ? ouiNon(obs.premiereFleurEpanouie)
    : ouiNon(obs.premiereObsAdulte);

  const effectif = isLigneuse
    ? ''
    : isHerbacee
    ? safe(obs.nbFleursApproximatif)
    : safe(obs.nbIndividusApproximatif);

  const complement = isLigneuse
    ? [
        obs.feuillaisonComm && `Feuilles : ${obs.feuillaisonComm}`,
        obs.floraisonComm && `Fleurs : ${obs.floraisonComm}`,
        obs.fructificationComm && `Fruits : ${obs.fructificationComm}`,
        obs.senescenceComm && `Sénescence : ${obs.senescenceComm}`
      ]
        .filter(Boolean)
        .join(' | ')
    : isHerbacee
    ? `État des feuilles : ${safe(obs.etatFeuilles)}`
    : safe(obs.comportementObserve);

  return [
    safe(obs.id),                                        // ID_OBSERVATION
    safe(obs.date),                                      // DATE
    safe(obs.tripType).toUpperCase(),                    // SAISON
    FICHE_LABEL[obs.ficheType] || safe(obs.ficheType),   // TYPE_FICHE
    safe(obs.groupName),                                 // GROUPE
    safe(obs.speciesName),                               // ESPECE
    safe(resolveLatinName(obs)),                         // NOM_LATIN
    safe(config.station) || DEFAULT_STATION,             // STATION
    resolveZone(obs),                                    // ZONE
    ouiNon(obs.feuillaisonDebut),                        // FEUILLAISON_DEBUT
    ouiNon(obs.feuillaisonPlein),                        // FEUILLAISON_PLEIN
    ouiNon(obs.floraisonDebut),                          // FLORAISON_DEBUT
    ouiNon(obs.floraisonPlein),                          // FLORAISON_PLEIN
    ouiNon(obs.fructificationDebut),                     // FRUCTIFICATION_DEBUT
    ouiNon(obs.fructificationPlein),                     // FRUCTIFICATION_PLEIN
    ouiNon(obs.senescenceDebut),                         // SENESCENCE_DEBUT
    ouiNon(obs.senescencePlein),                         // SENESCENCE_PLEIN
    premierEvenement,                                    // PREMIER_EVENEMENT
    effectif,                                            // EFFECTIF
    complement,                                          // COMPLEMENT
    safe(obs.weather),                                   // METEO
    obs.temperature === undefined ? '' : obs.temperature,// TEMPERATURE
    safe(obs.huveauneLevel),                             // NIVEAU_HUVEAUNE
    safe(obs.confidence),                                // CONFIANCE
    safe(obs.remarques),                                 // REMARQUES
    (obs.photos || []).join(' ; '),                      // PHOTOS
    new Date().toLocaleString('fr-FR'),                  // ENVOYE_LE
    'App Sentinelles de la Ripisylve'                    // SOURCE
  ];
}

/* -------------------------------------------------------------------------- */
/*  Transport HTTP                                                            */
/* -------------------------------------------------------------------------- */

interface RawResponse {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
}

/**
 * Envoie un payload au Google Apps Script.
 *
 * Google Apps Script ne renvoie pas toujours les en-têtes CORS permettant de
 * lire la réponse. On tente d'abord une requête lisible ; si le navigateur
 * bloque la lecture (opaque), on renvoie la même charge en mode "no-cors" :
 * la requête est bien transmise, et le script dédoublonne grâce à l'ID unique.
 */
async function postPayload(payload: Record<string, unknown>, config: OdsSheetsConfig): Promise<RawResponse> {
  const url = config.scriptUrl.trim();
  const body = JSON.stringify(payload);
  // Content-Type "text/plain" : évite le preflight OPTIONS de CORS.
  const headers = { 'Content-Type': 'text/plain;charset=utf-8' };

  try {
    const response = await fetch(url, { method: 'POST', headers, body, redirect: 'follow' });
    const text = await response.text();
    try {
      const json = JSON.parse(text) as RawResponse;
      return { ...json, _readable: true };
    } catch {
      // Google renvoie parfois une page HTML d'erreur avec un code 200
      // (déploiement obsolète, script absent, autorisation refusée…).
      // Ce n'est JAMAIS un succès : on le traduit en message actionnable.
      return {
        ok: false,
        _readable: false,
        error:
          translateGoogleError(text) ??
          `Réponse illisible du Google Sheet (HTTP ${response.status}). Vérifie que le script est bien déployé en « Application web », avec « Qui a accès : Tout le monde ».${
            response.status === 401 || response.status === 403
              ? ' Le déploiement refuse les utilisateurs anonymes.'
              : ''
          }`
      };
    }
  } catch {
    try {
      await fetch(url, { method: 'POST', mode: 'no-cors', headers, body });
      return { ok: true, _readable: false };
    } catch (networkError) {
      return { ok: false, error: `Envoi impossible : ${String(networkError)}` };
    }
  }
}

/**
 * Traduit les pages d'erreur HTML renvoyées par Google Apps Script en messages
 * exploitables par l'enseignant. Renvoie null si la page n'est pas identifiable.
 */
function translateGoogleError(html: string): string | null {
  if (!html || html[0] !== '<') return null;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();

  if (text.includes('fonction de script introuvable') || text.includes('script function not found')) {
    return "Le script déployé ne contient pas encore le code ODS. Ouvre le Google Sheet > Extensions > Apps Script, colle bien Code.gs, enregistre, puis Déployer > Gérer les déploiements > (crayon) > Version : Nouvelle version > Déployer.";
  }
  if (text.includes("n'a pas vérifié cette application") || text.includes('unverified app')) {
    return "Le déploiement attend ton autorisation : ouvre une fois l'URL /exec dans le navigateur, clique sur Avancé > Autoriser, puis réessaie.";
  }
  if (text.includes('autorisation') || text.includes('sign in') || text.includes('connexion')) {
    return 'Le script refuse les appels anonymes : redéploie avec « Exécuter en tant que : Moi » et « Qui a accès : Tout le monde ».';
  }
  if (text.includes('désolé') || text.includes('sorry') || text.includes('erreur')) {
    return "Google a renvoyé une page d'erreur. Ouvre l'URL /exec dans un navigateur pour lire le message exact, puis redéploie si besoin.";
  }
  return null;
}

function buildMessage(res: RawResponse, fallback: string): string {
  if (typeof res.error === 'string' && res.error) return res.error;
  if (typeof res.message === 'string' && res.message) return res.message;
  return fallback;
}

/** Envoie une ou plusieurs observations vers le Google Sheet. */
export async function syncObservations(
  observations: Observation[],
  config: OdsSheetsConfig,
  options: { overwrite?: boolean } = {}
): Promise<SyncResult> {
  if (!isSheetsConfigured(config)) {
    return { ok: false, message: "Le lien vers le Google Sheet n'est pas configuré." };
  }
  if (!observations.length) {
    return { ok: false, message: 'Aucune fiche à envoyer.' };
  }

  const rows = observations.map(obs => buildReleveRow(obs, config));

  const res = await postPayload(
    {
      action: 'append',
      token: config.token,
      format: FORMAT_VERSION,
      sheetName: config.sheetName,
      exportSheetName: config.exportSheetName,
      overwrite: options.overwrite === true,
      rows
    },
    config
  );

  if (res.ok === false) {
    return { ok: false, message: buildMessage(res, "L'envoi vers Google Sheets a échoué.") };
  }

  const n = observations.length;
  const plural = n > 1 ? 's' : '';
  const optimistic = res._readable !== true;

  return {
    ok: true,
    added: typeof res.added === 'number' ? res.added : n,
    updated: typeof res.updated === 'number' ? res.updated : 0,
    ignored: typeof res.ignored === 'number' ? res.ignored : 0,
    total: typeof res.total === 'number' ? res.total : undefined,
    exportRows: typeof res.exportRows === 'number' ? res.exportRows : undefined,
    optimistic,
    message: optimistic
      ? `${n} fiche${plural} envoyée${plural} au Google Sheet (en attente de confirmation du serveur).`
      : `${n} fiche${plural} envoyée${plural} au Google Sheet.`
  };
}

/** Vérifie que le lien, le jeton et le tableur sont opérationnels. */
export async function testSheetsConnection(config: OdsSheetsConfig): Promise<SyncResult> {
  if (!isSheetsConfigured(config)) {
    return { ok: false, message: "Colle d'abord l'URL /exec de ton Google Apps Script." };
  }

  const res = await postPayload(
    {
      action: 'ping',
      token: config.token,
      format: FORMAT_VERSION,
      sheetName: config.sheetName,
      exportSheetName: config.exportSheetName
    },
    config
  );

  if (res.ok === false) {
    return { ok: false, message: buildMessage(res, 'Connexion refusée par le Google Sheet.') };
  }

  const title = typeof res.spreadsheet === 'string' && res.spreadsheet ? ` « ${res.spreadsheet} »` : '';
  return {
    ok: true,
    message: `Connexion OK : tableur${title} — onglet « ${typeof res.sheet === 'string' ? res.sheet : config.sheetName} » prêt.`,
    total: typeof res.rows === 'number' ? res.rows : undefined
  };
}

/** Demande au script de régénérer l'onglet d'export ODS. */
export async function rebuildExportSheet(config: OdsSheetsConfig): Promise<SyncResult> {
  if (!isSheetsConfigured(config)) {
    return { ok: false, message: "Le lien vers le Google Sheet n'est pas configuré." };
  }
  const res = await postPayload(
    {
      action: 'export',
      token: config.token,
      sheetName: config.sheetName,
      exportSheetName: config.exportSheetName
    },
    config
  );
  if (res.ok === false) {
    return { ok: false, message: buildMessage(res, "La régénération de l'onglet ODS a échoué.") };
  }
  return {
    ok: true,
    exportRows: typeof res.exportRows === 'number' ? res.exportRows : undefined,
    message: `Onglet « ${config.exportSheetName} » régénéré au format obs-saisons.fr.`
  };
}

/** Construit le CSV miroir de l'onglet ODS_Export (secours hors-ligne). */
export function buildExportCsv(observations: Observation[], config: OdsSheetsConfig): string {
  const headers = [
    'DATE',
    'STATION',
    'GROUPE',
    'TYPE_FICHE',
    'ESPECE',
    'STADE_CODE',
    'STADE_LIBELLE',
    'EFFECTIF',
    'REMARQUES',
    'ID_RELEVE'
  ];

  const esc = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lignes: string[] = [headers.join(',')];

  const stades: { key: keyof Observation; code: string; label: string }[] = [
    { key: 'feuillaisonDebut', code: 'F1', label: 'Débourrement (F1)' },
    { key: 'feuillaisonPlein', code: 'F2', label: 'Feuilles étalées (F2)' },
    { key: 'floraisonDebut', code: 'Fl1', label: 'Début floraison (Fl1)' },
    { key: 'floraisonPlein', code: 'Fl2', label: 'Pleine floraison (Fl2)' },
    { key: 'fructificationDebut', code: 'Fr1', label: 'Apparition des fruits (Fr1)' },
    { key: 'fructificationPlein', code: 'Fr2', label: 'Maturité des fruits (Fr2)' },
    { key: 'senescenceDebut', code: 'F3', label: 'Changement de couleur (F3)' },
    { key: 'senescencePlein', code: 'F4', label: 'Chute des feuilles (F4)' }
  ];

  observations
    .slice()
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .forEach(obs => {
      const base = [obs.date, config.station || DEFAULT_STATION, obs.groupName, FICHE_LABEL[obs.ficheType], obs.speciesName];
      const suite = [obs.ficheType === 'herbacee' ? obs.nbFleursApproximatif ?? '' : obs.nbIndividusApproximatif ?? '', obs.remarques ?? '', obs.id];

      if (obs.ficheType === 'ligneuse') {
        stades.forEach(stade => {
          if (obs[stade.key]) {
            lignes.push([...base, stade.code, stade.label, ...suite].map(esc).join(','));
          }
        });
      } else if (obs.ficheType === 'herbacee' && obs.premiereFleurEpanouie) {
        lignes.push([...base, 'Fl1', 'Première fleur épanouie (Fl1)', ...suite].map(esc).join(','));
      } else if (obs.ficheType === 'animale' && obs.premiereObsAdulte) {
        lignes.push([...base, 'A1', 'Première observation adulte (A1)', ...suite].map(esc).join(','));
      }
    });

  return lignes.join('\n');
}
