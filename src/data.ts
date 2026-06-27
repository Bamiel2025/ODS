import { Species, TreeIndividu, Competence, Observation } from './types';

export const RIPISYLVE_COMPETENCES: Competence[] = [
  {
    id: 'comp1',
    category: 'Démarche Scientifique',
    label: 'Pratiquer des démarches scientifiques',
    description: 'Observer des structures biologiques, formuler des hypothèses phénologiques, enregistrer des mesures rigoureuses et interpréter des variations saisonnières.'
  },
  {
    id: 'comp2',
    category: 'Outils Numériques',
    label: 'Utiliser des outils numériques',
    description: 'Saisir des données d\'observation sur une interface numérique, comprendre la structure d\'une base de données citoyenne (ODS) et exporter des fichiers de données.'
  },
  {
    id: 'comp3',
    category: 'Espace & Temps',
    label: 'Se repérer dans l\'espace et le temps',
    description: 'Localiser les meandres de l\'Huveaune à Auriol, cartographier des individus arborés précis, et associer les changements biologiques au rythme des saisons.'
  },
  {
    id: 'comp4',
    category: 'Éco-Citoyenneté',
    label: 'Adopter un comportement éthique et responsable',
    description: 'Respecter l\'écosystème de la zone humide de l\'Ubelka (ne pas piétiner hors sentier, ne pas arracher de branches) et contribuer activement à un programme de science participative.'
  }
];

export const PHENOLOGY_LEAF_STAGES = [
  { code: 'F0', name: 'Bourgeon d\'hiver', description: 'Les bourgeons sont fermés, protégés par des écailles brunes ou grises, sans signe vert.', category: 'feuilles', illustration: 'Scale', tips: 'Regarde bien si l\'écaille est serrée ou commence à gonfler.' },
  { code: 'F1', name: 'Débourrement (F1)', description: 'Les écailles s\'écartent et le vert tendre de la jeune feuille devient visible à l\'extrémité du bourgeon.', category: 'feuilles', illustration: 'Sprout', tips: 'Valable dès que tu aperçois un pinceau vert ou de petites feuilles pliées dépasser.' },
  { code: 'F2', name: 'Feuilles étalées (F2)', description: 'Au moins 3 feuilles sur le rameau sont complètement dépliées et plates, montrant leur forme finale.', category: 'feuilles', illustration: 'Leaf', tips: 'La feuille doit être plate, pas froissée ni enroulée.' },
  { code: 'F3', name: 'Changement de couleur (F3)', description: 'Au moins la moitié (50%) des feuilles de l\'arbre ont pris leur couleur d\'automne (jaune, orange ou rouge).', category: 'feuilles', illustration: 'Palette', tips: 'Fais une estimation globale de l\'ensemble de l\'arbre.' },
  { code: 'F4', name: 'Chute des feuilles (F4)', description: 'Au moins la moitié (50%) des feuilles sont tombées au sol, laissant apparaître les branches nues.', category: 'feuilles', illustration: 'Wind', tips: 'Compare l\'arbre à sa silhouette estivale : y a-t-il plus de branches nues que de feuillage ?' }
] as const;

export const PHENOLOGY_FLOWER_STAGES = [
  { code: 'Fl0', name: 'Pas de fleurs', description: 'Aucun bourgeon floral n\'est ouvert ou visible.', category: 'fleurs', illustration: 'EyeOff', tips: 'Cherche bien sur toutes les branches, parfois les fleurs sont petites.' },
  { code: 'Fl1', name: 'Début floraison (Fl1)', description: 'Les premières fleurs s\'ouvrent sur l\'arbre. Les étamines ou les pétales sont visibles à l\'œil nu sur au moins 3 rameaux.', category: 'fleurs', illustration: 'Flower2', tips: 'Il suffit de quelques fleurs ouvertes pour valider ce stade.' },
  { code: 'Fl2', name: 'Pleine floraison (Fl2)', description: 'Au moins la moitié (50%) des boutons floraux sont ouverts et épanouis.', category: 'fleurs', illustration: 'FlameKindling', tips: 'C\'est le moment où l\'arbre est le plus coloré ou bourdonnant d\'insectes.' },
  { code: 'Fl3', name: 'Fin floraison (Fl3)', description: 'Les fleurs fanent, les pétales brunissent ou tombent. On ne voit pratiquement plus de pollen.', category: 'fleurs', illustration: 'Sparkles', tips: 'Les pétales jonchent le sol ou les fleurs se transforment en petites structures vertes.' }
] as const;

export const PHENOLOGY_FRUIT_STAGES = [
  { code: 'Fr0', name: 'Pas de fruits', description: 'Aucun fruit n\'est visible sur l\'arbre.', category: 'fruits', illustration: 'EyeOff', tips: 'Attention, les fruits verts peuvent ressembler à des feuilles de loin.' },
  { code: 'Fr1', name: 'Apparition des fruits (Fr1)', description: 'Les jeunes fruits sont formés juste après la fleur, mais ils sont encore petits, durs et verts.', category: 'fruits', illustration: 'Cherry', tips: 'Cherche de petites boules vertes ou des samares fines.' },
  { code: 'Fr2', name: 'Maturité des fruits (Fr2)', description: 'Les fruits atteignent leur couleur et leur taille définitives (noir pour le sureau, jaune/doré pour le bouleau, marron sec pour le frêne).', category: 'fruits', illustration: 'Apple', tips: 'Les fruits changent de couleur et deviennent mous ou cassants.' },
  { code: 'Fr3', name: 'Dissémination (Fr3)', description: 'Les fruits tombent de l\'arbre ou sont activement mangés par les oiseaux. Il n\'en reste presque plus.', category: 'fruits', illustration: 'Share2', tips: 'Regarde s\'il y a des fruits au sol ou des grappes vides.' }
] as const;

export const ODS_SPECIES: Species[] = [
  {
    id: 'frene',
    commonName: 'Frêne à feuilles étroites',
    latinName: 'Fraxinus angustifolia',
    family: 'Oléacées',
    description: 'Arbre emblématique des ripisylves méditerranéennes. Ses bourgeons d\'hiver sont brun foncé (contrairement au frêne commun qui les a noirs). Ses feuilles sont composées de folioles étroites.',
    habitat: 'Berges de l\'Huveaune, sols profonds et humides.',
    importance: 'Ses racines puissantes maintiennent les berges de l\'Huveaune contre l\'érosion lors des crues. Son feuillage offre une ombre précieuse qui maintient l\'eau au frais pour les poissons.',
    image: 'Frene',
    leafStages: [...PHENOLOGY_LEAF_STAGES],
    flowerStages: [...PHENOLOGY_FLOWER_STAGES],
    fruitStages: [...PHENOLOGY_FRUIT_STAGES]
  },
  {
    id: 'sureau',
    commonName: 'Sureau noir',
    latinName: 'Sambucus nigra',
    family: 'Adoxacées',
    description: 'Arbuste à croissance rapide avec des branches contenant une moelle blanche. Ses fleurs blanches en larges corymbes exhalent un parfum sucré très fort en printemps. Ses baies noires sont suspendues par des tiges rougeâtres.',
    habitat: 'Sous-bois humides, lisières de ripisylve près du collège.',
    importance: 'Héberge une faune incroyable : ses fleurs attirent des centaines de pollinisateurs et ses baies d\'automne constituent un réservoir de nourriture vital pour les oiseaux migrateurs avant de traverser la Méditerranée.',
    image: 'Sureau',
    leafStages: [...PHENOLOGY_LEAF_STAGES],
    flowerStages: [...PHENOLOGY_FLOWER_STAGES],
    fruitStages: [...PHENOLOGY_FRUIT_STAGES]
  },
  {
    id: 'bouleau',
    commonName: 'Bouleau verruqueux',
    latinName: 'Betula pendula',
    family: 'Bétulacées',
    description: 'Arbre reconnaissable à son écorce blanche et lisse se crevassant avec l\'âge. Ses branches fines et pendantes portent de petites feuilles triangulaires dentelées.',
    habitat: 'Sols légers, lisières de ripisylve ou zones perturbées de la vallée de l\'Huveaune.',
    importance: 'Arbre pionnier qui colonise rapidement les espaces ouverts. Ses graines nourrissent de nombreux petits oiseaux en hiver et son écorce imperméable protège le bois.',
    image: 'Bouleau',
    leafStages: [...PHENOLOGY_LEAF_STAGES],
    flowerStages: [...PHENOLOGY_FLOWER_STAGES],
    fruitStages: [...PHENOLOGY_FRUIT_STAGES]
  },
  {
    id: 'robinier',
    commonName: 'Robinier faux-acacia',
    latinName: 'Robinia pseudoacacia',
    family: 'Fabacées',
    description: 'Arbre à croissance rapide doté d\'épines sur ses jeunes rameaux et de feuilles composées de nombreuses folioles ovales. Ses fleurs blanches parfumées pendent en grappes au printemps.',
    habitat: 'Berges surélevées, sols drainés ou talus.',
    importance: 'Grâce à sa symbiose racinaire avec des bactéries, il enrichit le sol en azote. C\'est une espèce mellifère majeure qui offre un nectar abondant aux abeilles.',
    image: 'Robinier',
    leafStages: [...PHENOLOGY_LEAF_STAGES],
    flowerStages: [...PHENOLOGY_FLOWER_STAGES],
    fruitStages: [...PHENOLOGY_FRUIT_STAGES]
  },
  {
    id: 'noyer',
    commonName: 'Noyer commun',
    latinName: 'Juglans regia',
    family: 'Juglandacées',
    description: 'Grand arbre aux feuilles composées dégageant une odeur aromatique forte lorsqu\'on les frotte. Il produit des noix protégées par un brou vert épais.',
    habitat: 'Terres alluviales fertiles, terrasses de la ripisylve.',
    importance: 'Fournit des noix très nutritives recherchées par les écureuils et les oiseaux. Son ombre fraîche limite le dessèchement du sol environnant.',
    image: 'Noyer',
    leafStages: [...PHENOLOGY_LEAF_STAGES],
    flowerStages: [...PHENOLOGY_FLOWER_STAGES],
    fruitStages: [...PHENOLOGY_FRUIT_STAGES]
  },
  {
    id: 'noisetier',
    commonName: 'Noisetier commun',
    latinName: 'Corylus avellana',
    family: 'Bétulacées',
    description: 'Grand arbrisseau touffu ramifié dès la base. Ses fleurs mâles apparaissent en hiver sous forme de longs chatons pendants jaunes.',
    habitat: 'Sous-bois clairs, lisières de ripisylve de l\'Huveaune.',
    importance: 'Produit les noisettes, friandise préférée des écureuils roux et des mulots. Ses chatons hivernaux offrent du pollen précoce pour les premières abeilles.',
    image: 'Noisetier',
    leafStages: [...PHENOLOGY_LEAF_STAGES],
    flowerStages: [...PHENOLOGY_FLOWER_STAGES],
    fruitStages: [...PHENOLOGY_FRUIT_STAGES]
  }
];

export const UBELKA_TREES: TreeIndividu[] = [
  {
    id: 'tree-frene-1',
    speciesId: 'frene',
    label: 'Frêne Individu #1 (Près de la passerelle)',
    gps: { lat: 43.3692, lng: 5.6321 },
    description: 'Grand arbre situé à 5 mètres en amont de la passerelle piétonne reliant le collège au meandre.'
  },
  {
    id: 'tree-noyer-1',
    speciesId: 'noyer',
    label: 'Noyer Individu #2 (Sentier du héron)',
    gps: { lat: 43.3695, lng: 5.6325 },
    description: 'Grand arbre majestueux situé à l\'embranchement du sentier pédagogique, produisant de superbes noix.'
  },
  {
    id: 'tree-bouleau-1',
    speciesId: 'bouleau',
    label: 'Bouleau Individu #3 (Zone des méandres)',
    gps: { lat: 43.3689, lng: 5.6318 },
    description: 'Bel arbre à l\'écorce blanche caractéristique, sur la berge du grand méandre.'
  },
  {
    id: 'tree-robinier-1',
    speciesId: 'robinier',
    label: 'Robinier Individu #4 (Au ras de l\'eau)',
    gps: { lat: 43.3691, lng: 5.6315 },
    description: 'Arbre robuste situé près du sentier de surveillance de l\'Huveaune.'
  }
];

// Default lists of other species for dropdown selections
export const ODS_HERBACEOUS_SPECIES = [
  { id: 'ficaire', commonName: 'Ficaire fausse-renoncule', latinName: 'Ficaria verna', family: 'Renonculacées' },
  { id: 'chelidoine', commonName: 'Chélidoine grande éclaire', latinName: 'Chelidonium majus', family: 'Papavéracées' },
  { id: 'ortie', commonName: 'Ortie dioïque', latinName: 'Urtica dioica', family: 'Urticacées' },
  { id: 'pervenche', commonName: 'Pervenche rampante', latinName: 'Vinca minor', family: 'Apocynacées' },
  { id: 'iris', commonName: 'Iris d\'eau', latinName: 'Iris pseudacorus', family: 'Iridacées' }
];

export const ODS_ANIMAL_SPECIES = [
  { id: 'heron', commonName: 'Héron cendré', latinName: 'Ardea cinerea', family: 'Ardéidés' },
  { id: 'martin_pecheur', commonName: 'Martin-pêcheur d\'Europe', latinName: 'Alcedo atthis', family: 'Alcedinidés' },
  { id: 'cincle', commonName: 'Cincle plongeur', latinName: 'Cinclus cinclus', family: 'Cinclidés' },
  { id: 'castor', commonName: 'Castor d\'Europe', latinName: 'Castor fiber', family: 'Castoridés' },
  { id: 'sanglier', commonName: 'Sanglier', latinName: 'Sus scrofa', family: 'Suidés' },
  { id: 'colvert', commonName: 'Canard colvert', latinName: 'Anas platyrhynchos', family: 'Anatidés' },
  { id: 'ecureuil', commonName: 'Écureuil roux', latinName: 'Sciurus vulgaris', family: 'Sciuridés' }
];

// Seed initial observations so the app shows rich educational contents on initial load
export const INITIAL_OBSERVATIONS: Observation[] = [
  // --- SORTIE AUTOMNE (Novembre 2025) ---
  {
    id: 'obs-aut-1',
    date: '2025-11-12',
    tripType: 'automne',
    groupName: 'Groupe Blaireau (6ème)',
    treeId: 'tree-frene-1',
    speciesId: 'frene',
    ficheType: 'ligneuse',
    speciesName: 'Frêne à feuilles étroites',
    weather: 'soleil',
    temperature: 14,
    huveauneLevel: 'normal',
    confidence: 'eleve',
    photos: ['frene_automne_coloration'],
    isSubmitted: true,
    feuillaisonDebut: false,
    feuillaisonPlein: false,
    feuillaisonComm: 'Déjà en train de jaunir',
    floraisonDebut: false,
    floraisonPlein: false,
    floraisonComm: 'Pas de fleurs en cette saison',
    fructificationDebut: true,
    fructificationPlein: true,
    fructificationComm: 'Samares sèches brunes très nombreuses',
    senescenceDebut: true,
    senescencePlein: true,
    senescenceComm: 'La moitié des feuilles sont colorées',
    remarques: 'La ripisylve est magnifique avec des couleurs jaunes et brunes. Un martin-pêcheur a filé à toute vitesse au-dessus de l\'eau !'
  },
  {
    id: 'obs-aut-2',
    date: '2025-11-12',
    tripType: 'automne',
    groupName: 'Groupe Écureuil (6ème)',
    treeId: 'tree-noyer-1',
    speciesId: 'noyer',
    ficheType: 'ligneuse',
    speciesName: 'Noyer commun',
    weather: 'soleil',
    temperature: 14,
    huveauneLevel: 'normal',
    confidence: 'eleve',
    photos: ['noyer_automne_jaune'],
    isSubmitted: true,
    feuillaisonDebut: false,
    feuillaisonPlein: false,
    feuillaisonComm: 'Perte de feuilles commencée',
    floraisonDebut: false,
    floraisonPlein: false,
    floraisonComm: 'Pas de fleurs',
    fructificationDebut: false,
    fructificationPlein: false,
    fructificationComm: 'Brou desséché et noix déjà tombées au sol',
    senescenceDebut: true,
    senescencePlein: true,
    senescenceComm: 'Les grandes feuilles composées ont jauni et tombent',
    remarques: 'Le grand noyer a pris une belle couleur dorée. Plusieurs noix vides se trouvent au sol près du tronc, probablement grignotées par les écureuils !'
  },
  {
    id: 'obs-aut-3',
    date: '2025-11-14',
    tripType: 'automne',
    groupName: 'Groupe Castor (6ème)',
    treeId: 'tree-bouleau-1',
    speciesId: 'bouleau',
    ficheType: 'ligneuse',
    speciesName: 'Bouleau verruqueux',
    weather: 'nuageux',
    temperature: 12,
    huveauneLevel: 'normal',
    confidence: 'eleve',
    photos: ['bouleau_automne_or'],
    isSubmitted: true,
    feuillaisonDebut: false,
    feuillaisonPlein: false,
    feuillaisonComm: 'Coloration dorée complète',
    floraisonDebut: false,
    floraisonPlein: false,
    floraisonComm: 'Pas de fleurs',
    fructificationDebut: true,
    fructificationPlein: true,
    fructificationComm: 'Petites chatons pendants formés',
    senescenceDebut: true,
    senescencePlein: true,
    senescenceComm: 'Toutes les feuilles sont d\'un beau jaune doré',
    remarques: 'Les feuilles de cet arbre sont magnifiquement dorées. Son écorce blanche se détache sur le paysage d\'automne. Un écureuil roux aperçu dans le grand peuplier juste à côté.'
  },
  {
    id: 'obs-aut-4',
    date: '2025-11-14',
    tripType: 'automne',
    groupName: 'Groupe Cincle (6ème)',
    treeId: 'tree-robinier-1',
    speciesId: 'robinier',
    ficheType: 'ligneuse',
    speciesName: 'Robinier faux-acacia',
    weather: 'nuageux',
    temperature: 12,
    huveauneLevel: 'normal',
    confidence: 'moyen',
    photos: ['robinier_automne_jaune'],
    isSubmitted: true,
    feuillaisonDebut: true,
    feuillaisonPlein: true,
    feuillaisonComm: 'Feuilles jaunissant légèrement',
    floraisonDebut: false,
    floraisonPlein: false,
    floraisonComm: 'Pas de fleurs',
    fructificationDebut: true,
    fructificationPlein: true,
    fructificationComm: 'Gousses brunes sèches pendantes',
    senescenceDebut: true,
    senescencePlein: false,
    senescenceComm: 'Début de jaunissement et de chute des folioles',
    remarques: 'Le robinier commence à perdre doucement ses folioles d\'un jaune tendre. Un cincle plongeur observé sur un rocher.'
  },

  // --- SORTIE HIVER (Janvier 2026) ---
  {
    id: 'obs-hiv-1',
    date: '2026-01-22',
    tripType: 'hiver',
    groupName: 'Groupe Blaireau (6ème)',
    treeId: 'tree-frene-1',
    speciesId: 'frene',
    ficheType: 'ligneuse',
    speciesName: 'Frêne à feuilles étroites',
    weather: 'soleil',
    temperature: 6,
    huveauneLevel: 'haut',
    confidence: 'eleve',
    photos: ['frene_hiver_nu'],
    isSubmitted: true,
    feuillaisonDebut: false,
    feuillaisonPlein: false,
    feuillaisonComm: 'Branches totalement nues',
    floraisonDebut: false,
    floraisonPlein: false,
    floraisonComm: 'Pas de fleurs',
    fructificationDebut: false,
    fructificationPlein: false,
    fructificationComm: 'Plus aucun fruit',
    senescenceDebut: false,
    senescencePlein: false,
    senescenceComm: 'Pas de feuilles',
    remarques: 'L\'arbre n\'a plus aucune feuille. On voit très bien les bourgeons opposés brun foncé. Des traces de pattes de sanglier dans la boue.'
  },

  // --- SORTIE PRINTEMPS (Avril 2026, Herbacée & Animale de test) ---
  {
    id: 'obs-herb-1',
    date: '2026-04-05',
    tripType: 'printemps',
    groupName: 'Groupe Castor (6ème)',
    ficheType: 'herbacee',
    speciesName: 'Ficaire fausse-renoncule',
    isSubmitted: true,
    herbaceeZone: '20 m² autour du Robinier Individu #4',
    premiereFleurEpanouie: true,
    nbFleursApproximatif: 'Environ 25 fleurs jaunes',
    etatFeuilles: 'vertes',
    photos: [],
    remarques: 'De magnifiques petites fleurs jaunes brillantes en forme d\'étoiles au ras du sol humide.'
  },
  {
    id: 'obs-anim-1',
    date: '2026-04-05',
    tripType: 'printemps',
    groupName: 'Groupe Héron (6ème)',
    ficheType: 'animale',
    speciesName: 'Héron cendré',
    isSubmitted: true,
    animaleZone: '3 km² autour de la station',
    premiereObsAdulte: true,
    nbIndividusApproximatif: '1 adulte',
    comportementObserve: 'Immobile sur un rocher au milieu du grand méandre de l\'Huveaune, à l\'affût de petits poissons ou têtards.',
    photos: [],
    remarques: 'S\'est envolé majestueusement à notre approche en poussant un cri rauque.'
  }
];

export const PREDEFINED_PHOTOS: Record<string, { url: string; title: string; desc: string }> = {
  // Frêne
  'frene_automne_coloration': {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    title: 'Frêne en automne',
    desc: 'Feuilles composées prenant une teinte dorée/brune caractéristique.'
  },
  'frene_hiver_nu': {
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=400',
    title: 'Frêne en hiver',
    desc: 'Branches nues et bourgeons brun foncé opposés deux à deux sur les rameaux.'
  },
  'frene_printemps_debourrement': {
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=400',
    title: 'Frêne au printemps',
    desc: 'Bourgeons s\'écartant et laissant apparaître les feuilles naissantes.'
  },
  // Sureau
  'sureau_automne_chute': {
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=400',
    title: 'Sureau en automne',
    desc: 'Chute des feuilles et restes de grappes de baies vides.'
  },
  'sureau_hiver_nu': {
    url: 'https://images.unsplash.com/photo-1461989097359-edc3cba06f04?auto=format&fit=crop&q=80&w=400',
    title: 'Sureau en hiver',
    desc: 'Branches grises claires avec des lenticelles bien marquées et bourgeons opposés pointus.'
  },
  // Bouleau
  'bouleau_automne_or': {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400',
    title: 'Bouleau en automne',
    desc: 'Feuillage d\'un jaune d\'or lumineux très vif.'
  },
  'bouleau_hiver_nu': {
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=400',
    title: 'Bouleau en hiver',
    desc: 'Branches fines, écorce blanche typique et bourgeons alternes.'
  },
  // Robinier
  'robinier_automne_jaune': {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
    title: 'Robinier en automne',
    desc: 'Feuilles composées jaunissant doucement avant de tomber.'
  },
  // Noyer
  'noyer_automne_jaune': {
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=400',
    title: 'Noyer en automne',
    desc: 'Grandes feuilles composées jaunissantes de couleur d\'or.'
  },
  'noyer_hiver_nu': {
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=400',
    title: 'Noyer en hiver',
    desc: 'Rameaux épais, écorce grise lisse, gros bourgeons terminaux.'
  }
};

/**
 * Retourne le chemin d'accès local à l'image du stade végétatif pour une espèce donnée.
 * Gère le cas particulier du robinier qui utilise l'orthographe "fleuraison" à la place de "floraison".
 */
export const getStageImageUrl = (
  speciesId: string,
  category: 'feuillaison' | 'floraison' | 'fructification' | 'senescence'
): string => {
  const stageName = speciesId === 'robinier' && category === 'floraison' ? 'fleuraison' : category;
  return `/images/${speciesId} ${stageName}.jpg`;
};
