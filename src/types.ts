export type TripType = 'automne' | 'hiver' | 'printemps';

/**
 * Déduit la sortie ODS en cours à partir de la date du jour.
 *
 * Les trois sorties scolaires suivent le calendrier météo :
 *   - septembre → novembre : automne
 *   - décembre → février   : hiver
 *   - mars → juin           : printemps
 * Juillet-août (vacances d'été, aucune sortie) : on prépare la rentrée,
 * donc on retombe sur "automne".
 *
 * Sans cette détection, la sortie active restait figée sur une valeur
 * codée en dur et les fiches de septembre étaient rangées en "printemps".
 */
export function getCurrentTripType(refDate: Date = new Date()): TripType {
  const month = refDate.getMonth(); // 0 = janvier … 11 = décembre
  if (month >= 8 && month <= 10) return 'automne'; // sep, oct, nov
  if (month === 11 || month <= 1) return 'hiver'; // déc, jan, fév
  if (month >= 2 && month <= 5) return 'printemps'; // mar … juin
  return 'automne'; // juil, août : on prépare la rentrée
}

export interface PhenologicalStage {
  code: string; // e.g. "F1", "Fl1", "Fr1"
  name: string; // e.g. "Débourrement", "Début floraison"
  description: string;
  category: 'feuilles' | 'fleurs' | 'fruits';
  illustration: string; // Tailwind icon name or visual representation helper
  tips: string; // Advice for 6ème pupils
}

export interface Species {
  id: string;
  commonName: string;
  latinName: string;
  family: string;
  description: string;
  habitat: string;
  importance: string; // Why it's in the ripisylve
  image: string; // Abstract icon/color or path
  leafStages: PhenologicalStage[];
  flowerStages: PhenologicalStage[];
  fruitStages: PhenologicalStage[];
}

export interface TreeIndividu {
  id: string;
  speciesId: string;
  label: string; // e.g. "Frêne Individu A (près de la passerelle)"
  gps: { lat: number; lng: number };
  description: string;
}

export interface Observation {
  id: string;
  date: string;
  tripType: TripType;
  groupName: string;
  isSubmitted: boolean;

  // Suivi de la synchronisation vers Google Sheets
  syncedAt?: string; // Horodatage ISO du dernier envoi réussi vers le Google Sheet
  syncError?: string; // Dernier message d'erreur de synchronisation

  // Form Type Definition
  ficheType: 'ligneuse' | 'herbacee' | 'animale';
  speciesName: string; // e.g., "Frêne à feuilles étroites"
  photos: string[]; // Captured photo URLs/simulated keys
  remarques: string; // Overall remarks field

  // Shared environmental fields
  weather?: 'soleil' | 'nuageux' | 'pluie' | 'vent';
  temperature?: number;
  huveauneLevel?: 'bas' | 'normal' | 'haut';
  confidence?: 'faible' | 'moyen' | 'eleve';

  // --- Fiche 1: Espèce Ligneuse ---
  treeId?: string; // Optional reference to tagged tree
  speciesId?: string; // Match ODS_SPECIES if applicable
  
  feuillaisonDebut?: boolean;
  feuillaisonPlein?: boolean;
  feuillaisonComm?: string;
  
  floraisonDebut?: boolean;
  floraisonPlein?: boolean;
  floraisonComm?: string;
  
  fructificationDebut?: boolean;
  fructificationPlein?: boolean;
  fructificationComm?: string;
  
  senescenceDebut?: boolean;
  senescencePlein?: boolean;
  senescenceComm?: string;

  // --- Fiche 2: Espèce Herbacée ---
  herbaceeZone?: string; // "20 m² autour de [Arbre]"
  premiereFleurEpanouie?: boolean;
  nbFleursApproximatif?: string;
  etatFeuilles?: 'vertes' | 'jaunies' | 'absentes';

  // --- Fiche 3: Espèce Animale ---
  animaleZone?: string; // "3 km² autour de la station"
  premiereObsAdulte?: boolean;
  nbIndividusApproximatif?: string;
  comportementObserve?: string;

  // Legacy compatibility fields to prevent any issues with old data structures
  leafStageCode?: string;
  flowerStageCode?: string;
  fruitStageCode?: string;
  additionalFloraNotes?: string;
  faunaNotes?: string;
}

export interface Competence {
  id: string;
  category: string;
  label: string;
  description: string;
}
