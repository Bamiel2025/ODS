/**
 * ============================================================================
 *  ODS PROVENCE — COLLÈGE UBELKA, AURIOL
 *  "Sentinelles de la Ripisylve" — Pont entre l'application et Google Sheets
 * ============================================================================
 *
 *  MODE D'EMPLOI EXPRESS (3 minutes)
 *  1. Crée un nouveau Google Sheets (vide).
 *  2. Dans le tableur : Extensions > Apps Script.
 *  3. Supprime le contenu de l'éditeur et colle INTÉGRALEMENT ce fichier.
 *  4. Renseigne CONFIG.TOKEN avec le même jeton que dans l'application.
 *  5. Déploie : Déployer > Nouveau déploiement > (engrenage) "Application Web"
 *     - Exécuter en tant que : Moi
 *     - Qui a accès : Tout le monde  (indispensable : les tablettes des élèves
 *       ne sont pas connectées à ton compte Google)
 *  6. Copie l'URL "/exec" obtenue et colle-la dans l'application
 *     (onglet "Google Sheets").
 *  7. Clique sur "Tester la connexion" dans l'application : les onglets
 *     ODS_Releves et ODS_Export se créent automatiquement.
 *
 *  NOTES
 *  - Chaque relevé possède un ID unique : renvoyer deux fois la même fiche
 *    ne crée JAMAIS de doublon (la ligne est ignorée ou mise à jour).
 *  - Après chaque envoi, le tableau est automatiquement trié
 *    (date, puis groupe) et l'onglet ODS_Export est reconstruit.
 *  - L'onglet ODS_Export est au format attendu par
 *    https://www.obs-saisons.fr  (1 ligne = 1 stade phénologique observé).
 * ============================================================================
 */

var CONFIG = {
  // Jeton secret partagé : doit être IDENTIQUE à celui saisi dans l'application.
  // Laisse "" pour désactiver la vérification (déconseillé).
  TOKEN: 'ubelka-ods-2027',

  // Noms des onglets (créés automatiquement s'ils n'existent pas)
  SHEET_RELEVES: 'ODS_Releves',
  SHEET_EXPORT: 'ODS_Export',

  // Station par défaut (utilisée si l'application n'en fournit pas)
  STATION: "Collège Ubelka - Auriol (Ripisylve de l'Huveaune)",

  // Version du format de colonnes (ne pas modifier)
  FORMAT: 'ods-ubelka-v1'
};

/* --------------------------------------------------------------------------
 *  DÉFINITION DES COLONNES DE L'ONGLET "ODS_Releves"
 *  ATTENTION : cet ordre doit rester identique à src/lib/odsSheets.ts
 * -------------------------------------------------------------------------- */
var RELEVE_HEADERS = [
  'ID_OBSERVATION',      // 0
  'DATE',                // 1
  'SAISON',              // 2
  'TYPE_FICHE',          // 3
  'GROUPE',              // 4
  'ESPECE',              // 5
  'NOM_LATIN',           // 6
  'STATION',             // 7
  'ZONE',                // 8
  'FEUILLAISON_DEBUT',   // 9  -> F1
  'FEUILLAISON_PLEIN',   // 10 -> F2
  'FLORAISON_DEBUT',     // 11 -> Fl1
  'FLORAISON_PLEIN',     // 12 -> Fl2
  'FRUCTIFICATION_DEBUT',// 13 -> Fr1
  'FRUCTIFICATION_PLEIN',// 14 -> Fr2
  'SENESCENCE_DEBUT',    // 15 -> F3
  'SENESCENCE_PLEIN',    // 16 -> F4
  'PREMIER_EVENEMENT',   // 17 -> 1re fleur épanouie / 1re obs. adulte
  'EFFECTIF',            // 18 -> nb de fleurs / nb d'individus
  'COMPLEMENT',          // 19 -> état des feuilles / comportement
  'METEO',               // 20
  'TEMPERATURE',         // 21
  'NIVEAU_HUVEAUNE',     // 22
  'CONFIANCE',           // 23
  'REMARQUES',           // 24
  'PHOTOS',              // 25
  'ENVOYE_LE',           // 26
  'SOURCE'               // 27
];

/* --------------------------------------------------------------------------
 *  Colonnes de l'onglet "ODS_Export" (saisie sur https://www.obs-saisons.fr)
 *
 *  L'Observatoire des Saisons n'utilise PAS les codes maison de l'application
 *  mais l'échelle BBCH, limitée à 7 stades (kit enseignant ODS Provence 2025) :
 *     11 = ~10 % des feuilles développées     15 = ~50 % des feuilles développées
 *     61 = ~10 % des fleurs ouvertes          65 = ~50 % des fleurs ouvertes
 *     85 = ~50 % des fruits mûrs
 *     91 = ~10 % des feuilles colorées        95 = ~50 % des feuilles colorées
 *
 *  Les stades relevés par l'application mais absents du protocole ODS
 *  (apparition des fruits Fr1, 1re observation animale A1) ont un CODE_BBCH
 *  vide et la colonne TRANSMETTRE à "Non" : ils restent exploitables en classe
 *  mais ne sont pas à saisir sur le site.
 * -------------------------------------------------------------------------- */
var EXPORT_HEADERS = [
  'DATE',
  'STATION',
  'GROUPE',
  'TYPE_FICHE',
  'ESPECE',
  'CODE_BBCH',
  'STADE_LIBELLE',
  'STADE_INTERNE',
  'TRANSMETTRE',
  'EFFECTIF',
  'REMARQUES',
  'ID_RELEVE'
];

/* Table de correspondance booléen -> stade phénologique (espèce ligneuse).
 * bbch : code officiel ODS ; '' = stade hors protocole (non transmissible).   */
var STADES_LIGNEUSE = [
  { col: 9,  code: 'F1',  bbch: '11', label: 'Environ 10 % des feuilles sont développées' },
  { col: 10, code: 'F2',  bbch: '15', label: 'Environ 50 % des feuilles sont développées' },
  { col: 11, code: 'Fl1', bbch: '61', label: 'Environ 10 % des fleurs sont ouvertes' },
  { col: 12, code: 'Fl2', bbch: '65', label: 'Environ 50 % des fleurs sont ouvertes' },
  { col: 13, code: 'Fr1', bbch: '',   label: 'Apparition des fruits (hors protocole ODS)' },
  { col: 14, code: 'Fr2', bbch: '85', label: 'Environ 50 % des fruits sont mûrs' },
  { col: 15, code: 'F3',  bbch: '91', label: 'Environ 10 % des feuilles ont changé de couleur' },
  { col: 16, code: 'F4',  bbch: '95', label: 'Environ 50 % des feuilles ont changé de couleur' }
];

/* ==========================================================================
 *  POINTS D'ENTRÉE HTTP
 * ========================================================================== */

/** Requête GET : simple test de disponibilité depuis le navigateur. */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  if (action === 'export') {
    return jsonOut(handleExport(e.parameter || {}));
  }
  return jsonOut(handlePing(e && e.parameter ? e.parameter : {}));
}

/** Requête POST : réception des relevés envoyés par l'application. */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: 'Requête vide.' });
    }

    var data = JSON.parse(e.postData.contents);

    if (CONFIG.TOKEN && data.token !== CONFIG.TOKEN) {
      return jsonOut({ ok: false, error: 'Jeton invalide : vérifie le jeton dans l’application.' });
    }

    var action = data.action || 'append';

    if (action === 'ping')   return jsonOut(handlePing(data));
    if (action === 'append') return jsonOut(handleAppend(data));
    if (action === 'export') return jsonOut(handleExport(data));

    return jsonOut({ ok: false, error: 'Action inconnue : ' + action });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

/* ==========================================================================
 *  TRAITEMENTS
 * ========================================================================== */

/** Vérifie que la connexion fonctionne et que les onglets existent. */
function handlePing(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet_(ss, data.sheetName || CONFIG.SHEET_RELEVES, RELEVE_HEADERS);
  getOrCreateSheet_(ss, data.exportSheetName || CONFIG.SHEET_EXPORT, EXPORT_HEADERS);

  return {
    ok: true,
    action: 'ping',
    spreadsheet: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    sheet: sheet.getName(),
    rows: Math.max(0, sheet.getLastRow() - 1),
    format: CONFIG.FORMAT
  };
}

/**
 * Ajoute (ou met à jour) les relevés reçus.
 * @param {Object} data {rows: [][], sheetName, exportSheetName, overwrite}
 */
function handleAppend(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = data.sheetName || CONFIG.SHEET_RELEVES;
  var exportName = data.exportSheetName || CONFIG.SHEET_EXPORT;
  var sheet = getOrCreateSheet_(ss, sheetName, RELEVE_HEADERS);

  var rows = data.rows || [];
  if (!rows.length) {
    return { ok: false, error: 'Aucune ligne reçue.' };
  }

  var added = 0, updated = 0, ignored = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = normalizeRow_(rows[i]);
    var id = String(row[0]).trim();
    if (!id) { ignored++; continue; }

    var existingRow = findRowIndexById_(sheet, id);

    if (existingRow > 0) {
      if (data.overwrite) {
        sheet.getRange(existingRow, 1, 1, RELEVE_HEADERS.length).setValues([row]);
        updated++;
      } else {
        ignored++; // doublon : on ne réécrit pas la ligne déjà présente
      }
    } else {
      sheet.appendRow(row);
      added++;
    }
  }

  sortReleves_(sheet);
  var exportRows = rebuildExportSheet_(ss, sheetName, exportName);

  return {
    ok: true,
    action: 'append',
    added: added,
    updated: updated,
    ignored: ignored,
    total: Math.max(0, sheet.getLastRow() - 1),
    exportRows: exportRows,
    spreadsheetUrl: ss.getUrl()
  };
}

/** Reconstruit l'onglet d'export au format ODS (1 ligne = 1 stade observé). */
function handleExport(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var count = rebuildExportSheet_(
    ss,
    data.sheetName || CONFIG.SHEET_RELEVES,
    data.exportSheetName || CONFIG.SHEET_EXPORT
  );
  return { ok: true, action: 'export', exportRows: count, spreadsheetUrl: ss.getUrl() };
}

/* ==========================================================================
 *  FONCTIONS INTERNES
 * ========================================================================== */

/** Reconstruit entièrement l'onglet ODS_Export à partir de ODS_Releves. */
/**
 * Construit une ligne de l'onglet ODS_Export :
 * 5 colonnes de contexte + (code BBCH, libellé, code interne, transmissible)
 * + 3 colonnes de fin (effectif, remarques, id).
 */
function ligneExport_(base, bbch, label, codeInterne) {
  return base.slice(0, 5).concat([bbch, label, codeInterne, bbch ? 'Oui' : 'Non'], base.slice(9));
}

function rebuildExportSheet_(ss, sourceName, exportName) {
  var src = ss.getSheetByName(sourceName);
  if (!src) return 0;

  var out = getOrCreateSheet_(ss, exportName, EXPORT_HEADERS);
  out.clear();
  out.appendRow(EXPORT_HEADERS);

  var last = src.getLastRow();
  if (last < 2) { formatHeader_(out, EXPORT_HEADERS.length); return 0; }

  var values = src.getRange(2, 1, last - 1, RELEVE_HEADERS.length).getValues();
  var rows = [];

  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var type = String(r[3] || '');
    var remarques = [r[24] || '', r[19] || ''].join(' — ').replace(/^ — |— $/g, '').trim();
    var base = [r[1], r[7] || CONFIG.STATION, r[4], type, r[5], '', '', '', '', r[18], remarques, r[0]];

    if (type === 'Ligneuse') {
      for (var s = 0; s < STADES_LIGNEUSE.length; s++) {
        var st = STADES_LIGNEUSE[s];
        if (isOui_(r[st.col])) {
          rows.push(ligneExport_(base, st.bbch, st.label, st.code));
        }
      }
    } else if (type === 'Herbacée') {
      if (isOui_(r[9])) {
        rows.push(ligneExport_(base, '11', 'Environ 10 % des feuilles sont développées', 'F1'));
      }
      if (isOui_(r[10])) {
        rows.push(ligneExport_(base, '15', 'Environ 50 % des feuilles sont développées', 'F2'));
      }
      if (isOui_(r[17])) {
        rows.push(ligneExport_(base, '61', 'Première fleur épanouie (~10 % des fleurs ouvertes)', 'Fl1'));
      }
    } else if (type === 'Animale') {
      if (isOui_(r[17])) {
        rows.push(ligneExport_(base, '', 'Première observation adulte (hors échelle BBCH)', 'A1'));
      }
    }
  }

  if (rows.length) {
    out.getRange(2, 1, rows.length, EXPORT_HEADERS.length).setValues(rows);
    // Tri chronologique
    out.getRange(2, 1, rows.length, EXPORT_HEADERS.length).sort({ column: 1, ascending: true });
  }

  formatHeader_(out, EXPORT_HEADERS.length);
  out.setFrozenRows(1);
  return rows.length;
}

/** Trie l'onglet des relevés par date puis par groupe (tableau toujours ordonné). */
function sortReleves_(sheet) {
  var last = sheet.getLastRow();
  if (last < 3) { formatHeader_(sheet, RELEVE_HEADERS.length); sheet.setFrozenRows(1); return; }
  try {
    sheet.getRange(2, 1, last - 1, RELEVE_HEADERS.length).sort([
      { column: 2, ascending: true },  // DATE
      { column: 3, ascending: true },  // SAISON
      { column: 5, ascending: true }   // GROUPE
    ]);
  } catch (err) {
    // Le tri peut échouer si la feuille est protégée : ce n'est pas bloquant.
  }
  formatHeader_(sheet, RELEVE_HEADERS.length);
  sheet.setFrozenRows(1);
}

/** Récupère l'onglet (le crée avec ses en-têtes s'il n'existe pas). */
function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    formatHeader_(sheet, headers.length);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    formatHeader_(sheet, headers.length);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Met en forme la ligne d'en-tête. */
function formatHeader_(sheet, nbCols) {
  var header = sheet.getRange(1, 1, 1, nbCols);
  header.setFontWeight('bold')
        .setBackground('#065f46')
        .setFontColor('#ffffff')
        .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  for (var c = 1; c <= Math.min(nbCols, 12); c++) {
    sheet.autoResizeColumn(c);
  }
}

/** Complète/tronque une ligne pour qu'elle corresponde exactement aux colonnes. */
function normalizeRow_(row) {
  var out = [];
  for (var i = 0; i < RELEVE_HEADERS.length; i++) {
    var v = row[i];
    out.push(v === null || v === undefined ? '' : v);
  }
  return out;
}

/** Retourne l'index de la ligne possédant cet ID (0 si introuvable). */
function findRowIndexById_(sheet, id) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var finder = sheet.getRange(1, 1, last, 1).createTextFinder(String(id)).matchEntireCell(true);
  var found = finder.findNext();
  return found ? found.getRow() : 0;
}

/** Valeurs "Oui"/"oui"/true/1 considérées comme vraies. */
function isOui_(value) {
  if (typeof value === 'boolean') return value;
  var v = String(value || '').trim().toLowerCase();
  return v === 'oui' || v === 'true' || v === '1' || v === 'x' || v === 'vrai';
}

/** Sérialise la réponse en JSON. */
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ==========================================================================
 *  MENU PERSONNALISÉ DU TABLEUR
 * ========================================================================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('ODS Provence')
    .addItem('Reconstruire l’onglet ODS_Export', 'menuRebuildExport')
    .addItem('Vérifier la connexion (journal)', 'menuPing')
    .addSeparator()
    .addItem('À propos', 'menuAbout')
    .addToUi();
}

function menuRebuildExport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var n = rebuildExportSheet_(ss, CONFIG.SHEET_RELEVES, CONFIG.SHEET_EXPORT);
  SpreadsheetApp.getUi().alert('Onglet "' + CONFIG.SHEET_EXPORT + '" reconstruit : ' + n + ' ligne(s) au format ODS.');
}

function menuPing() {
  var r = handlePing({});
  SpreadsheetApp.getUi().alert(
    'Tableur : ' + r.spreadsheet + '\n' +
    'Onglet : ' + r.sheet + '\n' +
    'Relevés enregistrés : ' + r.rows
  );
}

function menuAbout() {
  SpreadsheetApp.getUi().alert(
    'Pont ODS Provence — Collège Ubelka\n\n' +
    'Les relevés envoyés depuis l’application arrivent dans l’onglet "' + CONFIG.SHEET_RELEVES + '".\n' +
    'L’onglet "' + CONFIG.SHEET_EXPORT + '" est régénéré automatiquement au format obs-saisons.fr.'
  );
}
