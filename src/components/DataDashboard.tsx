import React, { useState } from 'react';
import { Observation } from '../types';
import { ODS_SPECIES, UBELKA_TREES, PREDEFINED_PHOTOS } from '../data';
import { 
  Database, 
  Send, 
  FileSpreadsheet, 
  CheckCircle2, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Award,
  Printer,
  FileText,
  BookOpen
} from 'lucide-react';

interface DataDashboardProps {
  observations: Observation[];
  onDeleteObservation: (id: string) => void;
  onClearAll: () => void;
  onMarkSubmitted: (id: string) => void;
  isMobile?: boolean;
}

const DEFAULT_GROUPS = [
  "Groupe Blaireau (6ème)",
  "Groupe Castor (6ème)",
  "Groupe Écureuil (6ème)",
  "Groupe Cincle (6ème)",
  "Groupe Héron (6ème)"
];

export default function DataDashboard({ 
  observations, 
  onDeleteObservation, 
  onClearAll,
  onMarkSubmitted,
  isMobile = false
}: DataDashboardProps) {
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string>('');
  const [printMode, setPrintMode] = useState<'all' | 'single'>('all');
  const [printSingleId, setPrintSingleId] = useState<string | null>(null);

  const getSpeciesLabel = (speciesId: string) => {
    return ODS_SPECIES.find(s => s.id === speciesId)?.commonName || speciesId;
  };

  const getTreeLabel = (treeId: string) => {
    return UBELKA_TREES.find(t => t.id === treeId)?.label || treeId;
  };

  // Convert observations to a CSV formatted string and trigger download
  const handleExportCSV = () => {
    setIsExporting(true);
    
    // Header corresponding to the official "Observatoire des Saisons" (ODS) entry guidelines
    const headers = [
      'ID_OBSERVATION',
      'DATE_OBSERVATION',
      'SAISON',
      'TYPE_FICHE',
      'CLASSE_GROUPE',
      'ESPECE_NOM_COMMUN',
      'ZONE_STATION',
      'DETAILS_PHENOLOGIQUES',
      'REMARQUES'
    ];

    const rows = observations.map(obs => {
      let details = '';
      if (obs.ficheType === 'ligneuse') {
        details = `Feuillaison[Debut:${obs.feuillaisonDebut ? 'Oui' : 'Non'}|Plein:${obs.feuillaisonPlein ? 'Oui' : 'Non'}], Floraison[Debut:${obs.floraisonDebut ? 'Oui' : 'Non'}|Plein:${obs.floraisonPlein ? 'Oui' : 'Non'}], Fructification[Debut:${obs.fructificationDebut ? 'Oui' : 'Non'}|Plein:${obs.fructificationPlein ? 'Oui' : 'Non'}], Senescence[Debut:${obs.senescenceDebut ? 'Oui' : 'Non'}|Plein:${obs.senescencePlein ? 'Oui' : 'Non'}]`;
      } else if (obs.ficheType === 'herbacee') {
        details = `FleurEpanouie:${obs.premiereFleurEpanouie ? 'Oui' : 'Non'}, NbFleurs:${obs.nbFleursApproximatif}, EtatFeuilles:${obs.etatFeuilles}`;
      } else {
        details = `ObsAdulte:${obs.premiereObsAdulte ? 'Oui' : 'Non'}, NbIndividus:${obs.nbIndividusApproximatif}, Comportement:${obs.comportementObserve}`;
      }

      const zone = obs.ficheType === 'ligneuse' 
        ? "Ripisylve des méandres – Collège Ubelka, Auriol" 
        : obs.ficheType === 'herbacee' 
        ? obs.herbaceeZone 
        : obs.animaleZone;
      
      return [
        obs.id,
        obs.date,
        obs.tripType.toUpperCase(),
        obs.ficheType.toUpperCase(),
        `"${obs.groupName.replace(/"/g, '""')}"`,
        `"${obs.speciesName.replace(/"/g, '""')}"`,
        `"${(zone || '').replace(/"/g, '""')}"`,
        `"${details.replace(/"/g, '""')}"`,
        `"${(obs.remarques || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // File download trigger
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ods_provence_ubelka_6eme_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  // Simulate sharing to ODS database (highly rewarding for school children!)
  const handleSimulateSubmission = (obsId: string) => {
    onMarkSubmitted(obsId);
    setSubmissionFeedback(`La fiche de saisie #${obsId} a été envoyée avec succès sur le serveur de l'Observatoire des Saisons Provence ! Merci pour ton action éco-citoyenne.`);
    
    setTimeout(() => {
      setSubmissionFeedback('');
    }, 5000);
  };

  const handleSimulateAllSubmission = () => {
    observations.forEach(obs => {
      if (!obs.isSubmitted) {
        onMarkSubmitted(obs.id);
      }
    });
    setSubmissionFeedback(`Toutes les fiches de saisie en attente ont été envoyées en lot à l'IMBE (Observatoire des Saisons) !`);
    
    setTimeout(() => {
      setSubmissionFeedback('');
    }, 5000);
  };

  // Trigger browser print to generate PDF for all observations (the entire class logbook)
  const handlePrintPDF = () => {
    setPrintMode('all');
    setPrintSingleId(null);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Trigger browser print to generate PDF for a single specific observation card
  const handlePrintSinglePDF = (id: string) => {
    setPrintMode('single');
    setPrintSingleId(id);
    setTimeout(() => {
      window.print();
      // Reset after print dialog triggers
      setTimeout(() => {
        setPrintMode('all');
        setPrintSingleId(null);
      }, 500);
    }, 100);
  };

  // Detect distinct group names dynamically to ensure all custom group inputs are formatted
  const distinctGroups = Array.from(new Set([
    ...DEFAULT_GROUPS,
    ...observations.map(o => o.groupName)
  ])).sort();

  // Build a comparative matrix: for each of the 4 tagged trees, what is the status of foliage in Automne, Hiver, Printemps?
  const renderSeasonalComparison = () => {
    // Only filter for woody 'ligneuse' observations to prevent errors
    const lineObs = observations.filter(o => o.ficheType === 'ligneuse');

    return (
      <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-6 sm:p-8 print:hidden">
        <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 mb-4 flex items-center gap-1.5 border-b-2 border-emerald-50 pb-2.5">
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          Suivi des Arbres Témoins (Évolution Saisonnière)
        </h3>
        <p className="text-xs text-slate-500 font-sans font-semibold leading-relaxed mb-4 uppercase tracking-wider text-[10px]">
          Voici comment les stades phénologiques de nos 4 arbres témoins varient d'une sortie à l'autre d'après les relevés collectés par la classe de 6ème.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-emerald-100 bg-emerald-50/50 text-[10px] uppercase font-mono text-emerald-950 font-black">
                <th className="py-3 px-4">Arbre témoin</th>
                <th className="py-3 px-4 text-amber-800 bg-amber-100/50">Sortie Automne</th>
                <th className="py-3 px-4 text-sky-800 bg-sky-100/50">Sortie Hiver</th>
                <th className="py-3 px-4 text-emerald-800 bg-emerald-100/50">Sortie Printemps</th>
              </tr>
            </thead>
            <tbody>
              {UBELKA_TREES.map((tree) => {
                // Find latest observation of this tree for each season
                const autObs = lineObs.filter(o => o.treeId === tree.id && o.tripType === 'automne').pop();
                const hivObs = lineObs.filter(o => o.treeId === tree.id && o.tripType === 'hiver').pop();
                const priObs = lineObs.filter(o => o.treeId === tree.id && o.tripType === 'printemps').pop();

                return (
                  <tr key={tree.id} className="border-b border-emerald-50 hover:bg-emerald-50/20 transition-all">
                    <td className="py-3.5 px-4 font-black text-emerald-950 uppercase tracking-tight">
                      {tree.label}
                      <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide italic">{getSpeciesLabel(tree.speciesId)}</div>
                    </td>
                    <td className="py-3.5 px-4 bg-amber-50/10">
                      {autObs ? (
                        <div className="space-y-1">
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black uppercase font-mono">Relevé</span>
                          <span className="text-[9px] text-amber-950 block leading-tight font-medium">
                            Feuilles: {autObs.feuillaisonDebut ? 'Début' : 'Non'} {autObs.feuillaisonPlein && '(Plein)'} <br/>
                            Sénescence: {autObs.senescenceDebut ? 'Début' : 'Non'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold uppercase tracking-wider text-[9px] italic">Pas de relevé</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 bg-sky-50/10">
                      {hivObs ? (
                        <div className="space-y-1">
                          <span className="text-[10px] bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-black uppercase font-mono">Relevé</span>
                          <span className="text-[9px] text-sky-950 block leading-tight font-medium">
                            Feuilles: {hivObs.feuillaisonDebut ? 'Début' : 'Non'} {hivObs.senescenceDebut ? 'Sénescence' : 'Nues'}<br/>
                            Fleurs: {hivObs.floraisonDebut ? 'Chatons' : 'Non'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold uppercase tracking-wider text-[9px] italic">Pas de relevé</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 bg-emerald-50/10">
                      {priObs ? (
                        <div className="space-y-1">
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-black uppercase font-mono font-bold">Relevé</span>
                          <span className="text-[9px] text-emerald-950 block leading-tight font-medium">
                            Feuilles: {priObs.feuillaisonDebut ? 'Début' : 'Non'} {priObs.feuillaisonPlein && '(Plein)'} <br/>
                            Floraison: {priObs.floraisonDebut ? 'Début' : 'Non'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-bold uppercase tracking-wider text-[9.5px] animate-pulse">En attente...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* SCREEN VIEW ONLY - Hidden when printing */}
      <div className="space-y-6 print:hidden">
        
        {/* Simulation Feedback Alert */}
        {submissionFeedback && (
          <div className="bg-emerald-600 text-white rounded-3xl p-5 border-2 border-emerald-700 shadow-md animate-fade-in flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-200 shrink-0 animate-bounce" />
            <p className="text-xs font-black uppercase tracking-wider text-[11px] leading-relaxed">{submissionFeedback}</p>
          </div>
        )}

        {/* Main Stats Header */}
        <div className={isMobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 md:grid-cols-3 gap-4"}>
          <div className={`bg-white border-2 border-emerald-100 shadow-sm flex items-center gap-4 ${isMobile ? "rounded-xl p-3" : "rounded-3xl p-5"}`}>
            <div className={`${isMobile ? "w-9 h-9 text-base rounded-lg border" : "w-12 h-12 text-xl rounded-2xl border-2"} bg-emerald-50 text-emerald-800 flex items-center justify-center font-black font-mono border-emerald-200`}>
              {observations.length}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Total Fiches Saisie</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enregistrées par les élèves.</p>
            </div>
          </div>

          <div className={`bg-white border-2 border-emerald-100 shadow-sm flex items-center gap-4 ${isMobile ? "rounded-xl p-3" : "rounded-3xl p-5"}`}>
            <div className={`${isMobile ? "w-9 h-9 text-base rounded-lg border" : "w-12 h-12 text-xl rounded-2xl border-2"} bg-amber-50 text-amber-700 flex items-center justify-center font-black font-mono border-amber-200`}>
              {observations.filter(o => !o.isSubmitted).length}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-700">En attente d'envoi</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Stockées dans le navigateur.</p>
            </div>
          </div>

          <div className={`bg-white border-2 border-emerald-100 shadow-sm flex items-center gap-4 ${isMobile ? "rounded-xl p-3" : "rounded-3xl p-5"}`}>
            <div className={`${isMobile ? "w-9 h-9 text-base rounded-lg border" : "w-12 h-12 text-xl rounded-2xl border-2"} bg-sky-50 text-sky-700 flex items-center justify-center font-black font-mono border-sky-200`}>
              {observations.filter(o => o.isSubmitted).length}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-sky-700">Transmises à l'ODS</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Données validées transmises.</p>
            </div>
          </div>
        </div>

        {/* Seasonal progression visual comparison matrix */}
        {renderSeasonalComparison()}

        {/* Core observations table list */}
        <div className={`bg-white border-2 border-emerald-100 shadow-sm overflow-hidden ${isMobile ? "rounded-xl p-3" : "rounded-3xl p-6 sm:p-8"}`}>
          <div className={`flex flex-col gap-3 border-b-2 border-emerald-50 pb-3 mb-3 ${isMobile ? "" : "xl:flex-row xl:items-center justify-between"}`}>
            <div>
              <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                Base de données de la classe : Observations de terrain
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                Consultez, imprimez ou transmettez les fiches de la zone humide de l'Ubelka.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {observations.length > 0 && (
                <>
                  <button
                    onClick={handlePrintPDF}
                    className="bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-emerald-700 animate-pulse" />
                    Imprimer le Carnet (PDF)
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="bg-white hover:bg-emerald-50 border-2 border-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Exporter format ODS (CSV)
                  </button>
                  <button
                    onClick={handleSimulateAllSubmission}
                    disabled={observations.every(o => o.isSubmitted)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-700 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Tout envoyer vers ODS
                  </button>
                </>
              )}
            </div>
          </div>

          {observations.length === 0 ? (
            <div className="text-center py-12 bg-emerald-50/20 border-2 border-dashed border-emerald-100 rounded-3xl p-6">
              <Database className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
              <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">Aucune observation enregistrée</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed font-sans font-medium">
                Il n'y a pas encore de fiches de saisie enregistrées localement. Va dans l'onglet <strong>"Fiches de Saisie"</strong> pour inscrire ton premier relevé !
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {observations.map((obs) => (
                <div key={obs.id} className="bg-emerald-50/20 border border-emerald-100/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-950 text-xs uppercase tracking-tight">{obs.groupName}</span>
                    <span className={`text-[8.5px] font-black uppercase font-mono px-1.5 py-0.5 rounded border ${
                      obs.tripType === 'automne' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      obs.tripType === 'hiver' ? 'bg-sky-100 text-sky-850 border-sky-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {obs.tripType}
                    </span>
                  </div>
                  
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{obs.speciesName}</div>
                      <div className="text-[9.5px] text-slate-400 font-semibold">{obs.date}</div>
                    </div>
                    <div>
                      {obs.ficheType === 'ligneuse' && (
                        <span className="text-[8.5px] font-black uppercase bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">Ligneuse</span>
                      )}
                      {obs.ficheType === 'herbacee' && (
                        <span className="text-[8.5px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">Herbacée</span>
                      )}
                      {obs.ficheType === 'animale' && (
                        <span className="text-[8.5px] font-black uppercase bg-sky-50 text-sky-750 border border-sky-200 px-1.5 py-0.5 rounded">Animale</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-emerald-50/80 p-2 rounded-lg text-[10px] text-slate-700 leading-snug">
                    {obs.ficheType === 'ligneuse' ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold block">🍂 Senescence: <strong className="font-black text-emerald-900">{obs.senescenceDebut ? 'Oui' : 'Non'}</strong> {obs.senescencePlein && '(Plein)'}</span>
                        <span className="font-semibold block">🍃 Feuillaison: <strong className="font-black text-emerald-900">{obs.feuillaisonDebut ? 'Oui' : 'Non'}</strong> {obs.feuillaisonPlein && '(Plein)'}</span>
                      </div>
                    ) : obs.ficheType === 'herbacee' ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold block">✿ Fleur épanouie: <strong className="font-black text-emerald-900">{obs.premiereFleurEpanouie ? 'Oui' : 'Non'}</strong></span>
                        <span className="font-semibold block">🍃 Feuilles: <strong className="font-black text-emerald-900">{obs.etatFeuilles}</strong></span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold block">👁️ Adulte vu: <strong className="font-black text-sky-900">{obs.premiereObsAdulte ? 'Oui' : 'Non'}</strong></span>
                        <span className="font-semibold block">🔢 Individus: <strong className="font-black text-sky-900">{obs.nbIndividusApproximatif || '1'}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-emerald-50/50">
                    <div>
                      {obs.isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          Transmis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          En attente
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedObs(obs)}
                        className="p-1 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 rounded border border-emerald-100 cursor-pointer"
                        title="Voir"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePrintSinglePDF(obs.id)}
                        className="p-1 hover:bg-emerald-50 text-emerald-750 hover:text-emerald-950 rounded border border-emerald-100 cursor-pointer"
                        title="Exporter PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {!obs.isSubmitted && (
                        <button
                          onClick={() => handleSimulateSubmission(obs.id)}
                          className="p-1 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 rounded border border-emerald-100 cursor-pointer"
                          title="Envoyer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteObservation(obs.id)}
                        className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded border border-rose-100 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-emerald-100 bg-emerald-50/50 text-[10px] uppercase font-mono text-emerald-950 font-black">
                    <th className="py-3 px-4">Date & Saison</th>
                    <th className="py-3 px-4">Fiche</th>
                    <th className="py-3 px-4">Groupe d'élèves</th>
                    <th className="py-3 px-4">Espèce & Zone</th>
                    <th className="py-3 px-4">Constats principaux</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map((obs) => (
                    <tr key={obs.id} className="border-b border-emerald-50 hover:bg-emerald-50/10 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{obs.date}</div>
                        <span className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded border mt-1.5 inline-block ${
                          obs.tripType === 'automne' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          obs.tripType === 'hiver' ? 'bg-sky-100 text-sky-850 border-sky-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {obs.tripType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {obs.ficheType === 'ligneuse' && (
                          <span className="text-[9px] font-black uppercase bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md">🌳 Ligneuse</span>
                        )}
                        {obs.ficheType === 'herbacee' && (
                          <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md">🌱 Herbacée</span>
                        )}
                        {obs.ficheType === 'animale' && (
                          <span className="text-[9px] font-black uppercase bg-sky-50 text-sky-750 border border-sky-200 px-2 py-1 rounded-md">🐌 Animale</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-950 uppercase tracking-tight">
                        {obs.groupName}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{obs.speciesName}</div>
                        <div className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider truncate max-w-[200px]" title={obs.ficheType === 'ligneuse' ? "Ripisylve" : obs.ficheType === 'herbacee' ? obs.herbaceeZone : obs.animaleZone}>
                          {obs.ficheType === 'ligneuse' && "Ripisylve des méandres"}
                          {obs.ficheType === 'herbacee' && (obs.herbaceeZone || "Zone 20 m²")}
                          {obs.ficheType === 'animale' && (obs.animaleZone || "Zone 3 km²")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {obs.ficheType === 'ligneuse' ? (
                          <div className="text-[10px] space-y-0.5 leading-snug">
                            <span className="font-semibold block">
                              🍂 Senesc: <strong className="font-black text-emerald-900">{obs.senescenceDebut ? 'Oui' : 'Non'}</strong> {obs.senescencePlein && '(Plein)'}
                            </span>
                            <span className="font-semibold block">
                              🍃 Feuill: <strong className="font-black text-emerald-900">{obs.feuillaisonDebut ? 'Oui' : 'Non'}</strong> {obs.feuillaisonPlein && '(Plein)'}
                            </span>
                          </div>
                        ) : obs.ficheType === 'herbacee' ? (
                          <div className="text-[10px] space-y-0.5 leading-snug">
                            <span className="font-semibold block">✿ Fleur épanouie: <strong className="font-black text-emerald-900">{obs.premiereFleurEpanouie ? 'Oui' : 'Non'}</strong></span>
                            <span className="font-semibold block">🍃 Feuilles: <strong className="font-black text-emerald-900">{obs.etatFeuilles}</strong></span>
                          </div>
                        ) : (
                          <div className="text-[10px] space-y-0.5 leading-snug">
                            <span className="font-semibold block">👁️ Adulte vu: <strong className="font-black text-sky-900">{obs.premiereObsAdulte ? 'Oui' : 'Non'}</strong></span>
                            <span className="font-semibold block">🔢 Indiv: <strong className="font-black text-sky-900">{obs.nbIndividusApproximatif || '1'}</strong></span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {obs.isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border-2 border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Transmis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border-2 border-amber-200 px-2.5 py-0.5 rounded-full">
                            En attente
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedObs(obs)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintSinglePDF(obs.id)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-750 hover:text-emerald-900 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                            title="Exporter en PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {!obs.isSubmitted && (
                            <button
                              onClick={() => handleSimulateSubmission(obs.id)}
                              className="p-1.5 hover:bg-emerald-55 text-emerald-600 hover:text-emerald-800 rounded-lg transition-colors border border-transparent hover:border-emerald-300 cursor-pointer"
                              title="Synchroniser individuellement"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteObservation(obs.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors border border-transparent hover:border-rose-250 cursor-pointer"
                            title="Supprimer la fiche"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {observations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-emerald-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">
              <span>Base persistée localement ({observations.length} fiches)</span>
              <button 
                onClick={() => {
                  if (window.confirm("Es-tu sûr de vouloir vider TOUTE la base de données locale ? Cette action est irréversible !")) {
                    onClearAll();
                  }
                }}
                className="text-rose-600 hover:text-rose-850 font-black cursor-pointer uppercase tracking-wider"
              >
                Vider toute la base de la classe
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Observation Detail Modal Backdrop */}
      {selectedObs && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden border-2 border-emerald-100 animate-fade-in">
            {/* Header */}
            <div className={`p-5 text-white flex items-center justify-between ${
              selectedObs.tripType === 'automne' ? 'bg-amber-600' :
              selectedObs.tripType === 'hiver' ? 'bg-sky-600' :
              'bg-emerald-600'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-black bg-white/20 px-2.5 py-0.5 rounded-full">
                  Sortie {selectedObs.tripType} — {selectedObs.date}
                </span>
                <h4 className="font-black text-sm uppercase tracking-wider mt-1.5">{selectedObs.groupName}</h4>
              </div>
              <button 
                onClick={() => setSelectedObs(null)}
                className="bg-black/20 hover:bg-black/30 border border-white/20 text-white font-black text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-xl transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 text-xs font-sans">
              
              {/* Type, Species and Station banner */}
              <div className="grid grid-cols-2 gap-4 border-b border-emerald-50 pb-3">
                <div>
                  <span className="text-emerald-850 block uppercase font-mono text-[9px] font-black">Espèce observée</span>
                  <span className="font-black text-emerald-950 text-xs">{selectedObs.speciesName}</span>
                </div>
                <div>
                  <span className="text-emerald-850 block uppercase font-mono text-[9px] font-black">Type de Fiche</span>
                  <span className="font-bold text-slate-700 capitalize">
                    {selectedObs.ficheType === 'ligneuse' ? "🌳 Espèce ligneuse" : selectedObs.ficheType === 'herbacee' ? "🌱 Espèce herbacée" : "🐌 Espèce animale"}
                  </span>
                </div>
              </div>

              {/* DETAILS RENDER DEPENDING ON FICHE TYPE */}
              {selectedObs.ficheType === 'ligneuse' ? (
                <div className="space-y-3">
                  <span className="text-emerald-800 block uppercase font-mono text-[9px] font-black">Tableau des Stades Phénologiques</span>
                  
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-[11px]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 font-bold text-slate-700 text-[10px] uppercase font-mono border-b border-slate-150">
                          <th className="p-2">Stade</th>
                          <th className="p-2 text-center">Début (~10%)</th>
                          <th className="p-2 text-center">Plein (~50%)</th>
                          <th className="p-2">Commentaire</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-semibold">🍃 Feuillaison</td>
                          <td className="p-2 text-center font-bold">{selectedObs.feuillaisonDebut ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-center font-bold">{selectedObs.feuillaisonPlein ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-slate-500 italic">{selectedObs.feuillaisonComm || '-'}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold">🌸 Floraison</td>
                          <td className="p-2 text-center font-bold">{selectedObs.floraisonDebut ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-center font-bold">{selectedObs.floraisonPlein ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-slate-500 italic">{selectedObs.floraisonComm || '-'}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold">🍒 Fructification</td>
                          <td className="p-2 text-center font-bold">{selectedObs.fructificationDebut ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-center font-bold">{selectedObs.fructificationPlein ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-slate-500 italic">{selectedObs.fructificationComm || '-'}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold">🍂 Sénescence</td>
                          <td className="p-2 text-center font-bold">{selectedObs.senescenceDebut ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-center font-bold">{selectedObs.senescencePlein ? 'Oui' : 'Non'}</td>
                          <td className="p-2 text-slate-500 italic">{selectedObs.senescenceComm || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedObs.ficheType === 'herbacee' ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <span className="text-emerald-800 block uppercase font-mono text-[9px] font-black">Constats Herbacée</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Première fleur épanouie :</span>
                      <span className="font-bold text-slate-800">{selectedObs.premiereFleurEpanouie ? '✓ Oui' : '✗ Non'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">État des feuilles :</span>
                      <span className="font-bold text-slate-800 capitalize">{selectedObs.etatFeuilles}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Nombre approximatif de fleurs :</span>
                      <span className="font-bold text-slate-800">{selectedObs.nbFleursApproximatif || 'Non spécifié'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Zone d'étude :</span>
                      <span className="font-bold text-slate-800 text-[11px]">{selectedObs.herbaceeZone || 'Zone par défaut'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <span className="text-emerald-800 block uppercase font-mono text-[9px] font-black">Constats Animaux</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Première observation adulte :</span>
                      <span className="font-bold text-slate-800">{selectedObs.premiereObsAdulte ? '✓ Oui' : '✗ Non'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Nombre d'individus estimé :</span>
                      <span className="font-bold text-slate-800">{selectedObs.nbIndividusApproximatif || '1'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Comportement observé :</span>
                      <p className="font-medium text-slate-800 leading-relaxed bg-white border border-slate-150 p-2.5 rounded-lg italic">
                        "{selectedObs.comportementObserve || 'Aucun comportement particulier signalé.'}"
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Zone d'étude :</span>
                      <span className="font-bold text-slate-800">{selectedObs.animaleZone || 'Périmètre station de 3 km²'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Confirmation Show if present */}
              {selectedObs.photos && selectedObs.photos.length > 0 && (
                <div className="border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-40 relative">
                    <img 
                      src={selectedObs.photos[0]} 
                      alt="Captured stage" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-emerald-950/90 p-2 text-[9px] text-white font-medium text-center">
                      <span className="font-black uppercase tracking-wider text-[8px] text-emerald-200 block">Photo de confirmation attachée</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Remarques/Notes */}
              {selectedObs.remarques && (
                <div className="pt-2 border-t border-emerald-50">
                  <span className="text-emerald-800 block uppercase font-mono text-[9px] font-black">Remarques de terrain</span>
                  <p className="text-slate-700 leading-relaxed bg-emerald-55/10 border border-emerald-100/40 p-2.5 rounded-xl italic font-sans font-medium">
                    "{selectedObs.remarques}"
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer buttons */}
            <div className="bg-emerald-50 p-4 border-t-2 border-emerald-100 flex justify-between items-center">
              <button
                onClick={() => handlePrintSinglePDF(selectedObs.id)}
                className="bg-white hover:bg-emerald-105 border-2 border-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                Exporter en PDF
              </button>
              <button
                onClick={() => setSelectedObs(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-[10px] py-2 px-5 rounded-xl transition-colors cursor-pointer border border-emerald-700 shadow-sm"
              >
                Fermer la vue détaillée
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        PRINT VIEW CONTAINER (PDF PRINT FRIENDLY) 
        - Invisible on normal browser screens (hidden)
        - Only rendered when window.print() is executed (print:block)
      */}
      <div className="hidden print:block bg-white text-black p-4 font-sans max-w-4xl mx-auto">
        {printMode === 'single' && printSingleId ? (() => {
          const obs = observations.find(o => o.id === printSingleId);
          if (!obs) return null;
          return (
            <div className="border-4 border-emerald-800 p-8 rounded-3xl max-w-2xl mx-auto my-4 space-y-6">
              <div className="flex justify-between items-center border-b-2 border-emerald-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Observatoire des Saisons Provence</span>
                  <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-tight mt-1">Fiche de Saisie Terrain</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Collège Ubelka, Auriol • Projet Ripisylve</p>
                </div>
                <div className="text-right text-xs text-slate-500 font-bold uppercase">
                  <div className="bg-emerald-50 text-emerald-950 font-black px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider inline-block">SORTIE {obs.tripType.toUpperCase()}</div>
                  <div className="mt-1.5 text-[10px]">Date : {obs.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <h3 className="text-[9px] uppercase font-mono text-slate-400 font-black">Groupe d'élèves</h3>
                  <p className="font-black text-slate-950 text-sm uppercase">{obs.groupName}</p>
                </div>
                <div>
                  <h3 className="text-[9px] uppercase font-mono text-slate-400 font-black">Espèce observée</h3>
                  <p className="font-black text-emerald-950 text-sm uppercase">{obs.speciesName}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    {obs.ficheType === 'ligneuse' ? "🌳 Espèce Ligneuse" : obs.ficheType === 'herbacee' ? "🌱 Espèce Herbacée" : "🐌 Espèce Animale"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 space-y-3.5 text-xs">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">Données & Constats Phénologiques</h4>
                {obs.ficheType === 'ligneuse' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="font-bold block text-slate-800">🍃 Feuillaison</span>
                      <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{obs.feuillaisonDebut ? 'Oui' : 'Non'}</strong></span>
                      <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{obs.feuillaisonPlein ? 'Oui' : 'Non'}</strong></span>
                      {obs.feuillaisonComm && <p className="text-[10px] text-slate-500 italic">"{obs.feuillaisonComm}"</p>}
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block text-slate-800">🌸 Floraison</span>
                      <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{obs.floraisonDebut ? 'Oui' : 'Non'}</strong></span>
                      <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{obs.floraisonPlein ? 'Oui' : 'Non'}</strong></span>
                      {obs.floraisonComm && <p className="text-[10px] text-slate-500 italic">"{obs.floraisonComm}"</p>}
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-150">
                      <span className="font-bold block text-slate-800">🍒 Fructification</span>
                      <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{obs.fructificationDebut ? 'Oui' : 'Non'}</strong></span>
                      <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{obs.fructificationPlein ? 'Oui' : 'Non'}</strong></span>
                      {obs.fructificationComm && <p className="text-[10px] text-slate-500 italic">"{obs.fructificationComm}"</p>}
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-150">
                      <span className="font-bold block text-slate-800">🍂 Sénescence</span>
                      <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{obs.senescenceDebut ? 'Oui' : 'Non'}</strong></span>
                      <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{obs.senescencePlein ? 'Oui' : 'Non'}</strong></span>
                      {obs.senescenceComm && <p className="text-[10px] text-slate-500 italic">"{obs.senescenceComm}"</p>}
                    </div>
                  </div>
                ) : obs.ficheType === 'herbacee' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Première fleur épanouie :</span>
                      <span className="font-black text-slate-900 text-sm">{obs.premiereFleurEpanouie ? 'OUI' : 'NON'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">État des feuilles :</span>
                      <span className="font-black text-slate-900 text-sm uppercase">{obs.etatFeuilles}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-150">
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Nombre approximatif de fleurs :</span>
                      <span className="font-black text-slate-900">{obs.nbFleursApproximatif || 'Non indiqué'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Zone d'étude de la station :</span>
                      <span className="font-black text-slate-800 text-[11px]">{obs.herbaceeZone || 'Station zone humide'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Première observation adulte :</span>
                      <span className="font-black text-slate-900 text-sm">{obs.premiereObsAdulte ? 'OUI' : 'NON'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Nombre estimé d'individus :</span>
                      <span className="font-black text-slate-900 text-sm">{obs.nbIndividusApproximatif || '1'}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-150">
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Comportement observé :</span>
                      <p className="font-medium text-slate-800 leading-relaxed bg-white border border-slate-200 p-2.5 rounded-lg italic">
                        "{obs.comportementObserve || 'Aucun comportement particulier signalé.'}"
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Zone d'observation :</span>
                      <span className="font-black text-slate-850">{obs.animaleZone || 'Périmètre station de 3 km²'}</span>
                    </div>
                  </div>
                )}
              </div>

              {obs.remarques && (
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase font-mono text-slate-400 font-black">Remarques et notes de terrain</h4>
                  <p className="text-xs text-slate-800 italic bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl font-medium leading-relaxed">
                    "{obs.remarques}"
                  </p>
                </div>
              )}

              {obs.photos && obs.photos.length > 0 && (
                <div className="pt-2">
                  <span className="text-[9px] text-slate-400 italic font-medium block">
                    📎 Photo de confirmation capturée au cours de la sortie et archivée dans la base numérique.
                  </span>
                </div>
              )}

              <div className="text-center text-[9px] text-slate-450 font-black uppercase tracking-wider mt-12 border-t-2 border-slate-100 pt-5">
                Données conformes au protocole national de l'Observatoire des Saisons (ODS)
                <div className="mt-1 font-mono text-[8px] text-slate-400">ID Fiche : {obs.id} • Généré le {new Date().toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          );
        })() : (
          <>
            {/* Cover Page Header */}
            <div className="text-center pb-6 mb-8 border-b-4 border-emerald-800">
              <h1 className="text-3xl font-black uppercase text-emerald-900 tracking-tight">
                CARNET DE CLASSE ÉCO-CITOYEN
              </h1>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest mt-1">
                Observatoire des Saisons Provence • Collège Ubelka, Auriol
              </p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-2">
                Année Scolaire {new Date().getFullYear()} • Classe de 6ème (Projet Ripisylve de l'Huveaune)
              </p>
              
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-6 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="block font-black text-slate-900 text-lg">{observations.length}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-black">Fiches Total</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="block font-black text-slate-900 text-lg">5</span>
                  <span className="text-[9px] text-slate-500 uppercase font-black">Groupes de terrain</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="block font-black text-slate-900 text-lg">Ripisylve</span>
                  <span className="text-[9px] text-slate-500 uppercase font-black">Station</span>
                </div>
              </div>
            </div>

            {/* Separated sections for each of the 5 groups */}
            {distinctGroups.map((group) => {
              const groupObs = observations.filter(o => o.groupName === group);
              return (
                <div key={group} className="mt-8 pt-4 border-t-2 border-slate-100 page-break-after-always">
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl mb-4">
                    <h2 className="text-sm font-black uppercase text-slate-900">
                      📂 {group}
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {groupObs.length} observation(s) de terrain enregistrée(s)
                    </span>
                  </div>
                  
                  {groupObs.length === 0 ? (
                    <div className="text-xs text-slate-400 italic p-4 text-center border border-dashed border-slate-200 rounded-xl">
                      Aucune fiche n'a encore été enregistrée par ce groupe d'élèves.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {groupObs.map((obs) => (
                        <div key={obs.id} className="border border-slate-300 rounded-xl p-4 bg-white shadow-xs space-y-3 break-inside-avoid page-break-inside-avoid">
                          
                          {/* Sub header */}
                          <div className="flex justify-between items-center text-[10px] border-b border-slate-150 pb-2">
                            <span className="font-mono bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded font-black uppercase">
                              {obs.ficheType === 'ligneuse' ? 'Fiche 1: Espèce Ligneuse' : obs.ficheType === 'herbacee' ? 'Fiche 2: Espèce Herbacée' : 'Fiche 3: Espèce Animale'}
                            </span>
                            <span className="font-bold text-slate-500">
                              DATE : {obs.date} • SORTIE : {obs.tripType.toUpperCase()}
                            </span>
                          </div>

                          {/* Main fields */}
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Nom commun de l'espèce :</span>
                              <span className="font-black text-slate-900">{obs.speciesName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Station / Périmètre d'étude :</span>
                              <span className="font-bold text-slate-700">
                                {obs.ficheType === 'ligneuse' && "Ripisylve des méandres – Collège Ubelka, Auriol"}
                                {obs.ficheType === 'herbacee' && (obs.herbaceeZone || "Zone d'étude de 20 m²")}
                                {obs.ficheType === 'animale' && (obs.animaleZone || "Périmètre de 3 km² autour du Collège")}
                              </span>
                            </div>
                          </div>

                          {/* Phenological stages metrics */}
                          {obs.ficheType === 'ligneuse' ? (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] grid grid-cols-4 gap-2">
                              <div>
                                <span className="block font-black text-slate-800">🍃 Feuillaison</span>
                                <span>Début: {obs.feuillaisonDebut ? 'Oui' : 'Non'}</span> <br/>
                                <span>Plein: {obs.feuillaisonPlein ? 'Oui' : 'Non'}</span>
                                {obs.feuillaisonComm && <p className="text-[9px] text-slate-450 italic mt-1">"{obs.feuillaisonComm}"</p>}
                              </div>
                              <div>
                                <span className="block font-black text-slate-800">🌸 Floraison</span>
                                <span>Début: {obs.floraisonDebut ? 'Oui' : 'Non'}</span> <br/>
                                <span>Plein: {obs.floraisonPlein ? 'Oui' : 'Non'}</span>
                                {obs.floraisonComm && <p className="text-[9px] text-slate-450 italic mt-1">"{obs.floraisonComm}"</p>}
                              </div>
                              <div>
                                <span className="block font-black text-slate-800">🍒 Fructification</span>
                                <span>Début: {obs.fructificationDebut ? 'Oui' : 'Non'}</span> <br/>
                                <span>Plein: {obs.fructificationPlein ? 'Oui' : 'Non'}</span>
                                {obs.fructificationComm && <p className="text-[9px] text-slate-450 italic mt-1">"{obs.fructificationComm}"</p>}
                              </div>
                              <div>
                                <span className="block font-black text-slate-800">🍂 Sénescence</span>
                                <span>Début: {obs.senescenceDebut ? 'Oui' : 'Non'}</span> <br/>
                                <span>Plein: {obs.senescencePlein ? 'Oui' : 'Non'}</span>
                                {obs.senescenceComm && <p className="text-[9px] text-slate-450 italic mt-1">"{obs.senescenceComm}"</p>}
                              </div>
                            </div>
                          ) : obs.ficheType === 'herbacee' ? (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] grid grid-cols-3 gap-2">
                              <div>
                                <span className="block font-bold text-slate-500 uppercase text-[8px]">Première fleur épanouie</span>
                                <span className="font-black text-slate-900">{obs.premiereFleurEpanouie ? 'OUI' : 'NON'}</span>
                              </div>
                              <div>
                                <span className="block font-bold text-slate-500 uppercase text-[8px]">Nombre approximatif</span>
                                <span className="font-black text-slate-900">{obs.nbFleursApproximatif || 'Non indiqué'}</span>
                              </div>
                              <div>
                                <span className="block font-bold text-slate-500 uppercase text-[8px]">État des feuilles</span>
                                <span className="font-black text-slate-900 uppercase">{obs.etatFeuilles}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] grid grid-cols-3 gap-2">
                              <div>
                                <span className="block font-bold text-slate-500 uppercase text-[8px]">Première obs adulte</span>
                                <span className="font-black text-slate-900">{obs.premiereObsAdulte ? 'OUI' : 'NON'}</span>
                              </div>
                              <div>
                                <span className="block font-bold text-slate-500 uppercase text-[8px]">Nombre approximatif</span>
                                <span className="font-black text-slate-900">{obs.nbIndividusApproximatif || '1'}</span>
                              </div>
                              <div>
                                <span className="block font-bold text-slate-500 uppercase text-[8px]">Comportement observé</span>
                                <span className="font-black text-slate-900 italic">"{obs.comportementObserve || '-'}"</span>
                              </div>
                            </div>
                          )}

                          {/* Remarks and photos in print report */}
                          {obs.remarques && (
                            <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-150">
                              <strong className="font-bold">Commentaires de terrain :</strong> "{obs.remarques}"
                            </div>
                          )}
                          
                          {obs.photos && obs.photos.length > 0 && (
                            <div className="text-[9px] text-slate-400 italic">
                              📎 Photo de confirmation capturée au cours de la sortie et archivée dans la base numérique.
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Print Footer */}
            <div className="mt-12 pt-4 border-t border-slate-300 text-center text-[9px] text-slate-400 font-bold uppercase font-sans">
              Fiche de compilation éditée numériquement par l'application "Sentinelles de la Ripisylve". Données conformes au protocole national de l'Observatoire des Saisons.
            </div>
          </>
        )}
      </div>

    </div>
  );
}
