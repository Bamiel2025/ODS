import React, { useState } from 'react';
import { RIPISYLVE_COMPETENCES } from '../data';
import { 
  Award, 
  Calendar, 
  BookOpen, 
  Users, 
  ShieldAlert, 
  ExternalLink, 
  CheckSquare, 
  Sparkles, 
  Info,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function PedagogicalGuide() {
  const [activeTab, setActiveTab] = useState<'objectifs' | 'competences' | 'calendrier' | 'terrain' | 'ods-provence'>('objectifs');
  const [completedPreField, setCompletedPreField] = useState<Record<string, boolean>>({
    cloture: false,
    photos: false,
    gants: false,
    meteo: false,
    groupe: false
  });

  const togglePreField = (key: string) => {
    setCompletedPreField(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Navigation rails / vertical sidebar menu */}
      <div className="lg:col-span-1 bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm h-fit">
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 px-2 mb-4 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-emerald-400 rounded-full"></span>
          Menu de l'Activité
        </h3>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('objectifs')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all border-2 ${
              activeTab === 'objectifs' 
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100' 
                : 'text-emerald-800 bg-white border-emerald-50 hover:bg-emerald-50 hover:border-emerald-100'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'objectifs' ? 'text-white' : 'text-emerald-600'}`} />
            Présentation & Objectifs
          </button>
          <button
            onClick={() => setActiveTab('competences')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all border-2 ${
              activeTab === 'competences' 
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100' 
                : 'text-emerald-800 bg-white border-emerald-50 hover:bg-emerald-50 hover:border-emerald-100'
            }`}
          >
            <Award className={`w-4 h-4 ${activeTab === 'competences' ? 'text-white' : 'text-emerald-600'}`} />
            Compétences du Cycle 3
          </button>
          <button
            onClick={() => setActiveTab('calendrier')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all border-2 ${
              activeTab === 'calendrier' 
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100' 
                : 'text-emerald-800 bg-white border-emerald-50 hover:bg-emerald-50 hover:border-emerald-100'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'calendrier' ? 'text-white' : 'text-emerald-600'}`} />
            Scénario sur 3 Saisons
          </button>
          <button
            onClick={() => setActiveTab('terrain')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all border-2 ${
              activeTab === 'terrain' 
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100' 
                : 'text-emerald-800 bg-white border-emerald-50 hover:bg-emerald-50 hover:border-emerald-100'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeTab === 'terrain' ? 'text-white' : 'text-emerald-600'}`} />
            Consignes de Terrain
          </button>
          <button
            onClick={() => setActiveTab('ods-provence')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all border-2 ${
              activeTab === 'ods-provence' 
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100' 
                : 'text-emerald-800 bg-white border-emerald-50 hover:bg-emerald-50 hover:border-emerald-100'
            }`}
          >
            <ExternalLink className={`w-4 h-4 ${activeTab === 'ods-provence' ? 'text-white' : 'text-emerald-600'}`} />
            Observatoire des Saisons
          </button>
        </nav>

        <div className="mt-6 pt-5 border-t border-emerald-100">
          <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-md border border-emerald-700">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-100">Zone d'étude</h4>
            <div className="flex gap-2.5 items-start mt-2">
              <MapPin className="w-4 h-4 text-emerald-200 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase tracking-tight">Les Méandres de l'Huveaune</p>
                <p className="text-[10px] text-emerald-100/90 mt-0.5 leading-tight">Berges adjacentes au Collège Ubelka, Auriol (13)</p>
              </div>
            </div>
            <div className="mt-3.5 text-[10.5px] bg-emerald-700/50 rounded-xl p-3 text-emerald-100 leading-relaxed border border-emerald-500/20">
              La ripisylve est la forêt de bord de cours d'eau. Elle filtre les eaux, régule les inondations et préserve un microclimat.
            </div>
          </div>
        </div>
      </div>

      {/* Main content display */}
      <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-100 shadow-sm min-h-[400px]">
        {activeTab === 'objectifs' && (
          <div className="animate-fade-in space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">SVT Classe de 6ème</span>
              <h2 className="font-sans font-black text-2xl text-emerald-950 uppercase tracking-tight mt-3">Projet Ripisylve & Climat à l'Ubelka</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans font-medium">
                Comment le changement climatique modifie-t-il le cycle de vie de la forêt de bord de rivière ?
              </p>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3 font-sans">
              <p>
                La zone humide située au niveau des <strong>méandres de l'Huveaune</strong>, juste derrière la clôture du collège Ubelka à Auriol, est un écosystème précieux. Elle abrite une <strong>ripisylve</strong> (végétation de bord d'eau) remarquable, adaptée aux conditions méditerranéennes humides.
              </p>
              <p>
                Dans le cadre de l'<strong>Observatoire des Saisons (ODS) Provence</strong>, les élèves de 6ème mettent en place un protocole de suivi scientifique rigoureux. Ils vont observer individuellement 4 arbres témoins tout au long de l'année scolaire (Automne, Hiver, Printemps) et noter leur développement (phénologie).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-50/20 p-5 rounded-2xl border-2 border-emerald-100/60">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Pourquoi la phénologie ?
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  La phénologie est l'étude des événements périodiques de la vie des plantes (floraison, apparition des feuilles, fruits). C'est le meilleur indicateur biologique de la réponse du vivant aux variations climatiques directes (températures, précipitations).
                </p>
              </div>
              <div className="bg-emerald-50/20 p-5 rounded-2xl border-2 border-emerald-100/60">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Rôle de la Ripisylve
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  La ripisylve de l'Huveaune protège contre l'érosion lors des crues cévenoles et méditerranéennes. Elle fournit une ombre thermique qui réduit l'évaporation de l'eau et accueille une biodiversité fragile (insectes aquatiques, castors, oiseaux migrateurs).
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-100 p-5 rounded-2xl flex gap-3.5 items-start shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">Le but de cette application</h4>
                <p className="text-[11px] text-emerald-900 leading-relaxed mt-1.5 font-sans">
                  Cette interface numérique sert de <strong>carnet de terrain interactif</strong>. Elle permet aux groupes d'élèves de se repérer géographiquement, de comprendre les stades clés grâce au guide visuel intégré, de consigner directement leurs données sur tablette, puis de les exporter au format normalisé de l'Observatoire des Saisons pour une transmission citoyenne.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competences' && (
          <div className="animate-fade-in space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">Socle Commun de Compétences</span>
              <h2 className="font-sans font-black text-2xl text-emerald-950 uppercase tracking-tight mt-3">Compétences Travaillées (Cycle 3)</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans font-medium">
                Cette activité s'inscrit pleinement dans le programme officiel de SVT de la classe de 6ème.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RIPISYLVE_COMPETENCES.map((comp) => (
                <div key={comp.id} className="border-2 border-emerald-100/60 rounded-2xl p-4 hover:border-emerald-300 transition-all bg-emerald-50/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md font-mono font-bold uppercase">
                      {comp.category}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{comp.label}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 font-sans">
                    {comp.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-5 border-2 border-emerald-100 bg-emerald-50/40 rounded-2xl">
              <h4 className="font-black text-emerald-950 text-xs flex items-center gap-2 mb-2 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Lien direct avec le programme officiel (BO) :
              </h4>
              <ul className="list-disc pl-4 text-[11px] text-emerald-900 space-y-1.5 font-sans leading-relaxed">
                <li><strong>Le vivant, sa diversité et les fonctions qui le caractérisent</strong> : identifier des critères de classification, caractériser le développement d'une plante de la graine à la fructification.</li>
                <li><strong>La Terre, une planète habitée - Les écosystèmes</strong> : place des êtres vivants dans les réseaux trophiques, interactions avec les facteurs physico-chimiques (météo, cours d'eau).</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'calendrier' && (
          <div className="animate-fade-in space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">Scénario d'apprentissage</span>
              <h2 className="font-sans font-black text-2xl text-emerald-950 uppercase tracking-tight mt-3">Le Déroulement des 3 Sorties</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans font-medium">
                L'année scolaire est rythmée par trois séances pratiques de relevé au bord de l'Huveaune.
              </p>
            </div>

            <div className="relative border-l-2 border-emerald-200 pl-6 ml-3 space-y-6">
              {/* Étape 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></span>
                <div className="bg-emerald-50/20 p-5 rounded-2xl border-2 border-emerald-100/60">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-850 text-[10px] px-2 py-0.5 rounded font-black border border-amber-200">SORTIE 1</span>
                      L'Automne (Mi-Novembre)
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">Relevé #1</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    <strong>Focus biologique</strong> : Coloration des feuilles et chute. Présence des fruits mûrs tardifs (samares de frêne, gousses de robinier pendantes).
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 font-sans">
                    <strong>Travail élève</strong> : Estimer si plus de 50% de l'arbre a jauni/rougi. Prendre des photos de l'état du feuillage pour le simulateur. Observer la hauteur de l'eau de l'Huveaune après les premières pluies d'automne.
                  </p>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></span>
                <div className="bg-emerald-50/20 p-5 rounded-2xl border-2 border-emerald-100/60">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="bg-sky-100 text-sky-850 text-[10px] px-2 py-0.5 rounded font-black border border-sky-200">SORTIE 2</span>
                      L'Hiver (Fin Janvier)
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">Relevé #2</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    <strong>Focus biologique</strong> : Repos végétatif complet. Identification des arbres par leur silhouette, leur écorce blanche typique du bouleau, et la disposition de leurs bourgeons d\'hiver (opposés pour le frêne, alternes pour le bouleau).
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 font-sans">
                    <strong>Travail élève</strong> : Confirmer la chute totale des feuilles. Dessiner un bourgeon pour repérer sa forme et ses écailles de protection. Mesurer la température de l'air.
                  </p>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></span>
                <div className="bg-emerald-50/20 p-5 rounded-2xl border-2 border-emerald-100/60">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-850 text-[10px] px-2 py-0.5 rounded font-black border border-emerald-200">SORTIE 3</span>
                      Le Printemps (Début Avril)
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">Relevé #3</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    <strong>Focus biologique</strong> : Le réveil de la nature ! Débourrement (éclosion des bourgeons), déploiement rapide des premières feuilles. Début de floraison (fleurs de sureau en cymes blanches odorantes, samares vertes de frêne).
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 font-sans">
                    <strong>Travail élève</strong> : Repérer les premiers bouts de vert sortant des bourgeons (Stade F1). Compter les fleurs épanouies pour déterminer si la pleine floraison (Fl2) est atteinte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terrain' && (
          <div className="animate-fade-in space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">Sécurité & Éco-citoyenneté</span>
              <h2 className="font-sans font-black text-2xl text-emerald-950 uppercase tracking-tight mt-3">La Charte du Jeune Éco-Observateur</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans font-medium">
                Consignes obligatoires pour respecter le protocole de l'Huveaune en sécurité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border-2 border-amber-100 bg-amber-50/10 rounded-2xl p-5">
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-2 uppercase tracking-wider mb-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  Sécurité Physique des Élèves
                </h4>
                <ul className="text-[11px] text-amber-900 space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
                  <li><strong>Ne jamais s'approcher du bord de l'eau</strong> sans la présence directe du professeur (les berges de l'Huveaune peuvent être glissantes et abruptes).</li>
                  <li>Porter obligatoirement des chaussures fermées de sport ou des bottes de terrain.</li>
                  <li>Rester sur le <strong>Sentier du Héron</strong> et ne pas tenter de descendre dans le lit actif du fleuve.</li>
                  <li>En cas de pluie forte ou d'alerte météo de crue, la sortie est annulée immédiatement.</li>
                </ul>
              </div>

              <div className="border-2 border-emerald-100 bg-emerald-50/10 rounded-2xl p-5">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-2 uppercase tracking-wider mb-2.5">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  Protection de l'Écosystème
                </h4>
                <ul className="text-[11px] text-emerald-900 space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
                  <li><strong>Zéro cueillette</strong> : il est interdit d'arracher des feuilles ou des bourgeons pour les ramener en classe. On observe sur pied !</li>
                  <li>Éviter le piétinement de la flore des sols humides (mousses, jeunes pousses) en marchant en file indienne sur les tracés.</li>
                  <li>Ne laisser absolument aucun déchet (utiliser la poubelle de tri du collège au retour).</li>
                  <li>Ne pas crier pour ne pas effrayer les oiseaux de la ripisylve (comme le héron cendré ou le martin-pêcheur).</li>
                </ul>
              </div>
            </div>

            {/* Interactive student check-list */}
            <div className="p-5 bg-emerald-50/40 border-2 border-emerald-100 rounded-2xl">
              <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-3.5">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                Liste de préparation avant de franchir la passerelle :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border-2 border-emerald-100/60 cursor-pointer hover:bg-emerald-50/40">
                  <input 
                    type="checkbox" 
                    checked={completedPreField.cloture} 
                    onChange={() => togglePreField('cloture')}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold">Fermeture de la grille du collège</span>
                </label>
                <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border-2 border-emerald-100/60 cursor-pointer hover:bg-emerald-50/40">
                  <input 
                    type="checkbox" 
                    checked={completedPreField.photos} 
                    onChange={() => togglePreField('photos')}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold">Tablette chargée & application ouverte</span>
                </label>
                <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border-2 border-emerald-100/60 cursor-pointer hover:bg-emerald-50/40">
                  <input 
                    type="checkbox" 
                    checked={completedPreField.gants} 
                    onChange={() => togglePreField('gants')}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold">Vêtements longs protecteurs</span>
                </label>
                <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border-2 border-emerald-100/60 cursor-pointer hover:bg-emerald-50/40">
                  <input 
                    type="checkbox" 
                    checked={completedPreField.meteo} 
                    onChange={() => togglePreField('meteo')}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold">Relevé météo initial effectué</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ods-provence' && (
          <div className="animate-fade-in space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">Sciences Participatives</span>
              <h2 className="font-sans font-black text-2xl text-emerald-950 uppercase tracking-tight mt-3">L'Observatoire des Saisons Provence</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans font-medium">
                Un programme de recherche pour comprendre l'impact du réchauffement climatique sur notre flore locale.
              </p>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3 font-sans">
              <p>
                L'<strong>Observatoire des Saisons Provence</strong> (décliné à partir de l'Observatoire des Saisons national coordonné par le CNRS) est piloté régionalement par l'<strong>IMBE</strong> (Institut Méditerranéen de Biodiversité et d'Écologie) à Marseille.
              </p>
              <p>
                En Provence, les espèces réagissent au stress hydrique de l'été et à la douceur hivernale croissante. Grâce aux observations récoltées par les écoles, collèges, lycées et citoyens, les chercheurs découvrent que :
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 text-[11.5px] leading-relaxed">
                <li>Les dates de débourrement au printemps avancent d'environ 2 à 3 jours par décennie.</li>
                <li>Les périodes de floraison sont plus précoces mais parfois écourtées si la sécheresse s'installe.</li>
                <li>La coloration des feuilles en automne tend à être repoussée plus tard dans l'année.</li>
              </ul>
            </div>

            <div className="p-5 bg-emerald-950 text-white rounded-2xl flex gap-4 items-start border border-emerald-900 shadow-md">
              <Info className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-black text-emerald-200 text-xs uppercase tracking-wider">Comment le collège partage-t-il ses données ?</h4>
                <p className="text-[11px] text-emerald-100 leading-relaxed font-sans">
                  Au retour en classe de SVT après chaque sortie, le professeur se connecte sur le site officiel de l'Observatoire des Saisons (<span className="underline text-emerald-300 font-mono">www.obs-saisons.fr</span>) avec le compte de l'établissement. L'application génère un fichier d'export contenant les relevés complets de tous les groupes d'élèves de la classe, facilitant une saisie manuelle ou un transfert groupé.
                </p>
                <div className="flex gap-2.5 flex-wrap pt-1.5">
                  <a 
                    href="https://www.obs-saisons.fr/ods-provence" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-750 text-[10px] font-black uppercase tracking-wider text-white px-3 py-1.5 rounded-lg border border-emerald-700 shadow-sm transition-all"
                  >
                    Site de l'ODS Provence
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://www.obs-saisons.fr/participer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-750 text-[10px] font-black uppercase tracking-wider text-white px-3 py-1.5 rounded-lg border border-emerald-700 shadow-sm transition-all"
                  >
                    Protocole ODS national
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
