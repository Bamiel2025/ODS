import React, { useState, useEffect } from 'react';
import { UBELKA_TREES, ODS_SPECIES, ODS_HERBACEOUS_SPECIES, ODS_ANIMAL_SPECIES, PREDEFINED_PHOTOS, getStageImageUrl } from '../data';
import { Observation, TripType } from '../types';
import { 
  Camera, 
  CheckCircle, 
  FileText, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  TreeDeciduous,
  Flower,
  Bird,
  Users,
  Calendar,
  MapPin,
  ClipboardList,
  Printer
} from 'lucide-react';

interface ObservationFormProps {
  onSaveObservation: (obs: Omit<Observation, 'id' | 'isSubmitted'>) => void;
  activeTripType: TripType;
  isMobile?: boolean;
}

const FORM_GROUPS = [
  "Groupe Blaireau (6ème)",
  "Groupe Castor (6ème)",
  "Groupe Écureuil (6ème)",
  "Groupe Cincle (6ème)",
  "Groupe Héron (6ème)"
];

export default function ObservationForm({ onSaveObservation, activeTripType, isMobile = false }: ObservationFormProps) {
  // Master states
  const [ficheType, setFicheType] = useState<'ligneuse' | 'herbacee' | 'animale'>('ligneuse');
  const [groupName, setGroupName] = useState<string>(FORM_GROUPS[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarques, setRemarques] = useState<string>('');
  
  // Fiche 1 Ligneuse States
  const [ligneuseSpeciesId, setLigneuseSpeciesId] = useState<string>('frene');
  const [customLigneuseSpecies, setCustomLigneuseSpecies] = useState<string>('');
  const [treeId, setTreeId] = useState<string>('tree-frene-1');
  
  const [feuillaisonDebut, setFeuillaisonDebut] = useState<boolean>(false);
  const [feuillaisonPlein, setFeuillaisonPlein] = useState<boolean>(false);
  const [feuillaisonComm, setFeuillaisonComm] = useState<string>('');

  const [floraisonDebut, setFloraisonDebut] = useState<boolean>(false);
  const [floraisonPlein, setFloraisonPlein] = useState<boolean>(false);
  const [floraisonComm, setFloraisonComm] = useState<string>('');

  const [fructificationDebut, setFructificationDebut] = useState<boolean>(false);
  const [fructificationPlein, setFructificationPlein] = useState<boolean>(false);
  const [fructificationComm, setFructificationComm] = useState<string>('');

  const [senescenceDebut, setSenescenceDebut] = useState<boolean>(false);
  const [senescencePlein, setSenescencePlein] = useState<boolean>(false);
  const [senescenceComm, setSenescenceComm] = useState<string>('');

  // Fiche 2 Herbacée States
  const [herbaceeSpeciesId, setHerbaceeSpeciesId] = useState<string>('ficaire');
  const [customHerbaceeSpecies, setCustomHerbaceeSpecies] = useState<string>('');
  const [herbaceeZone, setHerbaceeZone] = useState<string>("20 m² autour du Frêne Individu #1");
  const [premiereFleurEpanouie, setPremiereFleurEpanouie] = useState<boolean>(false);
  const [nbFleursApproximatif, setNbFleursApproximatif] = useState<string>('');
  const [etatFeuilles, setEtatFeuilles] = useState<'vertes' | 'jaunies' | 'absentes'>('vertes');

  // Fiche 3 Animale States
  const [animaleSpeciesId, setAnimaleSpeciesId] = useState<string>('heron');
  const [customAnimaleSpecies, setCustomAnimaleSpecies] = useState<string>('');
  const [animaleZone] = useState<string>("3 km² autour de la station");
  const [premiereObsAdulte, setPremiereObsAdulte] = useState<boolean>(false);
  const [nbIndividusApproximatif, setNbIndividusApproximatif] = useState<string>('');
  const [comportementObserve, setComportementObserve] = useState<string>('');

  // Photo Capture Simulation State
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Success / Error Feedback
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Sensible season defaults for woody plants
  useEffect(() => {
    if (activeTripType === 'automne') {
      setFeuillaisonDebut(false);
      setFeuillaisonPlein(false);
      setFloraisonDebut(false);
      setFloraisonPlein(false);
      setFructificationDebut(true);
      setFructificationPlein(true);
      setSenescenceDebut(true);
      setSenescencePlein(false);
    } else if (activeTripType === 'hiver') {
      setFeuillaisonDebut(false);
      setFeuillaisonPlein(false);
      setFloraisonDebut(false);
      setFloraisonPlein(false);
      setFructificationDebut(false);
      setFructificationPlein(false);
      setSenescenceDebut(false);
      setSenescencePlein(false);
    } else {
      setFeuillaisonDebut(true);
      setFeuillaisonPlein(false);
      setFloraisonDebut(true);
      setFloraisonPlein(false);
      setFructificationDebut(false);
      setFructificationPlein(false);
      setSenescenceDebut(false);
      setSenescencePlein(false);
    }
    setCapturedPhotoUrl('');
  }, [activeTripType, ligneuseSpeciesId, ficheType]);

  // Adjust reference tree when woody species is changed
  useEffect(() => {
    const matchedTree = UBELKA_TREES.find(t => t.speciesId === ligneuseSpeciesId);
    if (matchedTree) {
      setTreeId(matchedTree.id);
    }
  }, [ligneuseSpeciesId]);

  // Get active species display name
  const getSelectedSpeciesName = () => {
    if (ficheType === 'ligneuse') {
      if (ligneuseSpeciesId === 'autre') return customLigneuseSpecies || 'Espèce ligneuse indéterminée';
      return ODS_SPECIES.find(s => s.id === ligneuseSpeciesId)?.commonName || '';
    } else if (ficheType === 'herbacee') {
      if (herbaceeSpeciesId === 'autre') return customHerbaceeSpecies || 'Espèce herbacée indéterminée';
      return ODS_HERBACEOUS_SPECIES.find(s => s.id === herbaceeSpeciesId)?.commonName || '';
    } else {
      if (animaleSpeciesId === 'autre') return customAnimaleSpecies || 'Espèce animale indéterminée';
      return ODS_ANIMAL_SPECIES.find(s => s.id === animaleSpeciesId)?.commonName || '';
    }
  };

  // Simulate photographic capture
  const handleSimulateCapture = () => {
    setIsCapturing(true);
    
    // Select an appropriate matching image from Unsplash depending on the species
    let simulatedUrl = 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=400';
    
    if (ficheType === 'ligneuse') {
      if (ligneuseSpeciesId === 'autre') {
        simulatedUrl = 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=400';
      } else {
        // Retourne l'image locale correspondante du dossier public/images
        if (activeTripType === 'automne') {
          simulatedUrl = getStageImageUrl(ligneuseSpeciesId, 'senescence');
        } else if (activeTripType === 'printemps') {
          simulatedUrl = getStageImageUrl(ligneuseSpeciesId, 'feuillaison');
        } else {
          // En hiver, utilise l'image sans feuilles d'Unsplash
          const winterKeys = {
            'frene': 'frene_hiver_nu',
            'sureau': 'sureau_hiver_nu',
            'bouleau': 'bouleau_hiver_nu',
            'noyer': 'noyer_hiver_nu'
          };
          const key = winterKeys[ligneuseSpeciesId];
          if (key && PREDEFINED_PHOTOS[key]) {
            simulatedUrl = PREDEFINED_PHOTOS[key].url;
          } else {
            simulatedUrl = PREDEFINED_PHOTOS['frene_hiver_nu'].url;
          }
        }
      }
    } else if (ficheType === 'herbacee') {
      simulatedUrl = 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&q=80&w=400'; // Spring flowers
    } else {
      if (animaleSpeciesId === 'heron') {
        simulatedUrl = 'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=400'; // Bird
      } else if (animaleSpeciesId === 'castor') {
        simulatedUrl = 'https://images.unsplash.com/photo-1581403485777-be8e8095b6cb?auto=format&fit=crop&q=80&w=400'; // Beaver
      } else {
        simulatedUrl = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400'; // Woods wildlife
      }
    }

    setTimeout(() => {
      setCapturedPhotoUrl(simulatedUrl);
      setIsCapturing(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const speciesName = getSelectedSpeciesName();
    if (!speciesName.trim()) {
      setValidationError("Veuillez renseigner le nom de l'espèce.");
      return;
    }

    if (!groupName) {
      setValidationError("S'il vous plaît, sélectionnez un groupe.");
      return;
    }

    // Prepare unified payload
    const basePayload = {
      date,
      tripType: activeTripType,
      groupName,
      ficheType,
      speciesName,
      remarques: remarques.trim(),
      photos: capturedPhotoUrl ? [capturedPhotoUrl] : [],
      confidence: 'eleve' as const,
      weather: 'soleil' as const,
      temperature: 15,
      huveauneLevel: 'normal' as const
    };

    let finalPayload = {};

    if (ficheType === 'ligneuse') {
      finalPayload = {
        ...basePayload,
        treeId,
        speciesId: ligneuseSpeciesId !== 'autre' ? ligneuseSpeciesId : undefined,
        feuillaisonDebut,
        feuillaisonPlein,
        feuillaisonComm: feuillaisonComm.trim(),
        floraisonDebut,
        floraisonPlein,
        floraisonComm: floraisonComm.trim(),
        fructificationDebut,
        fructificationPlein,
        fructificationComm: fructificationComm.trim(),
        senescenceDebut,
        senescencePlein,
        senescenceComm: senescenceComm.trim()
      };
    } else if (ficheType === 'herbacee') {
      finalPayload = {
        ...basePayload,
        herbaceeZone,
        premiereFleurEpanouie,
        nbFleursApproximatif: nbFleursApproximatif.trim(),
        etatFeuilles
      };
    } else {
      finalPayload = {
        ...basePayload,
        animaleZone,
        premiereObsAdulte,
        nbIndividusApproximatif: nbIndividusApproximatif.trim(),
        comportementObserve: comportementObserve.trim()
      };
    }

    onSaveObservation(finalPayload as any);

    // Reset Form
    setShowSuccess(true);
    setRemarques('');
    setFeuillaisonComm('');
    setFloraisonComm('');
    setFructificationComm('');
    setSenescenceComm('');
    setNbFleursApproximatif('');
    setNbIndividusApproximatif('');
    setComportementObserve('');
    setCapturedPhotoUrl('');
    setCustomLigneuseSpecies('');
    setCustomHerbaceeSpecies('');
    setCustomAnimaleSpecies('');

    setTimeout(() => {
      setShowSuccess(false);
    }, 4500);
  };

  const handlePrintFormPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  return (
    <>
      <div className={`print:hidden ${isMobile ? "space-y-4" : "space-y-6"}`}>
      {/* Selection of the digital form via a dropdown menu */}
      <div className={`bg-white border-2 border-emerald-100 shadow-sm ${isMobile ? "p-4 rounded-2xl" : "p-6 rounded-3xl"}`}>
        <div className={`flex flex-col items-stretch justify-between gap-4 ${isMobile ? "" : "md:flex-row md:items-center"}`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <label htmlFor="formTypeSelector" className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                Sélectionner la fiche de terrain :
              </label>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Adapté au protocole de l'Observatoire des Saisons (ODS)</p>
            </div>
          </div>

          <div className={isMobile ? "w-full" : "w-full md:w-80"}>
            <select
              id="formTypeSelector"
              value={ficheType}
              onChange={(e) => {
                setFicheType(e.target.value as any);
                setValidationError('');
              }}
              className="w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-900 rounded-2xl px-4 py-3.5 text-xs font-black uppercase tracking-wider focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all shadow-xs"
            >
              <option value="ligneuse">🌳 Fiche 1 – Espèce ligneuse</option>
              <option value="herbacee">🌱 Fiche 2 – Espèce herbacée</option>
              <option value="animale">🐌 Fiche 3 – Espèce animale</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {showSuccess && (
        <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-lg border-2 border-emerald-700 animate-fade-in flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider">Fiche enregistrée avec succès !</h4>
            <p className="text-[11px] text-emerald-100 mt-0.5 font-medium leading-relaxed">
              Tes observations sur la ripisylve ont été ajoutées dans le carnet de classe local. Tu peux maintenant les consulter dans l'onglet <strong>"Carnet de Classe"</strong> pour les vérifier avant de les exporter !
            </p>
          </div>
        </div>
      )}

      {/* VALIDATION ERROR */}
      {validationError && (
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-sans font-bold leading-relaxed text-xs">{validationError}</p>
        </div>
      )}

      {/* FORM ROOT */}
      <form onSubmit={handleSubmit} className={isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-12 gap-6"}>
        
        {/* LEFT COLUMN - METADATA (5 cols) */}
        <div className={isMobile ? "space-y-4" : "lg:col-span-5 space-y-6"}>
          <div className={`bg-white border-2 border-emerald-100 shadow-sm space-y-4 ${isMobile ? "p-4 rounded-2xl" : "p-6 rounded-3xl"}`}>
            <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b-2 border-emerald-50 pb-2.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Informations Générales
            </h3>

            {/* Date Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Date de l'observation :
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-semibold focus:bg-white focus:border-emerald-400 outline-none transition-all"
              />
            </div>

            {/* Group Selection Dropdown */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                Groupe d'élèves :
              </label>
              <select
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-bold focus:bg-white focus:border-emerald-400 outline-none cursor-pointer transition-all"
              >
                {FORM_GROUPS.map((g, i) => (
                  <option key={i} value={g}>{g}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                La classe de 6ème comprend 5 groupes officiels de surveillance.
              </p>
            </div>

            {/* Station / Location display depending on type */}
            <div className="bg-emerald-50 border-2 border-emerald-100/50 p-4 rounded-2xl text-[11px] text-emerald-900 font-sans leading-relaxed space-y-1.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black uppercase tracking-wider text-[10px] text-emerald-950 block">Station de référence :</span>
                  {ficheType === 'ligneuse' && "Ripisylve des méandres – Collège Ubelka, Auriol"}
                  {ficheType === 'herbacee' && "Zone d'étude : 20 m² autour de l'arbre témoin"}
                  {ficheType === 'animale' && "Zone d'étude : 3 km² autour de la station"}
                </div>
              </div>
            </div>
          </div>

          {/* Photo Capture Simulator Widget */}
          <div className={`bg-white border-2 border-emerald-100 shadow-sm space-y-4 ${isMobile ? "p-4 rounded-2xl" : "p-6 rounded-3xl"}`}>
            <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b-2 border-emerald-50 pb-2.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Photo de confirmation
            </h3>

            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
              Pour valider ton relevé ODS Provence, prends une photo du sujet témoin avec la caméra de ton smartphone ou tablette :
            </p>

            {capturedPhotoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 group">
                <img 
                  src={capturedPhotoUrl} 
                  alt="Captured observation" 
                  className="w-full h-40 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setCapturedPhotoUrl('')}
                    className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer hover:bg-rose-700"
                  >
                    Effacer la photo
                  </button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-emerald-950/90 p-2 text-center text-white text-[9px] font-black uppercase">
                  ✓ Photo prise avec succès !
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateCapture}
                disabled={isCapturing}
                className="w-full h-32 border-2 border-dashed border-emerald-100 rounded-2xl hover:bg-emerald-50/20 hover:border-emerald-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-400 group active:scale-95 disabled:opacity-50"
              >
                <Camera className={`w-8 h-8 group-hover:text-emerald-600 transition-colors ${isCapturing ? 'animate-bounce text-emerald-600' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-850">
                  {isCapturing ? 'Mise au point...' : '[ Bouton prendre une photo ]'}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">Caméra numérique de terrain</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - CONTENT DEPENDING ON FICHE TYPE (7 cols) */}
        <div className={isMobile ? "space-y-4" : "lg:col-span-7 space-y-6"}>
          
          {/* FICHE 1: ESPÈCE LIGNEUSE */}
          {ficheType === 'ligneuse' && (
            <div className={`bg-white border-2 border-emerald-100 shadow-sm space-y-5 ${isMobile ? "p-4 rounded-2xl" : "p-6 rounded-3xl"}`}>
              <div className="border-b-2 border-emerald-50 pb-3">
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <TreeDeciduous className="w-4 h-4 text-emerald-600" />
                  Fiche 1 – Espèce Ligneuse (Arbre / Arbuste)
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Relevé des 4 arbres témoins fléchés du sentier pédagogique.
                </p>
              </div>

              {/* Species selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  Nom de l'espèce ligneuse :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={ligneuseSpeciesId}
                    onChange={(e) => setLigneuseSpeciesId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-bold focus:bg-white focus:border-emerald-400 outline-none cursor-pointer transition-all"
                  >
                    {ODS_SPECIES.map((s) => (
                      <option key={s.id} value={s.id}>{s.commonName} ({s.latinName})</option>
                    ))}
                    <option value="autre">Autre espèce ligneuse...</option>
                  </select>

                  {ligneuseSpeciesId === 'autre' && (
                    <input
                      type="text"
                      required
                      placeholder="Saisir le nom commun de l'espèce..."
                      value={customLigneuseSpecies}
                      onChange={(e) => setCustomLigneuseSpecies(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-emerald-100 rounded-2xl px-4 py-3 text-xs font-sans font-semibold focus:bg-white focus:border-emerald-400 outline-none transition-all"
                    />
                  )}
                </div>
              </div>

              {/* Tagged tree matcher info */}
              {ligneuseSpeciesId !== 'autre' && (
                <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-xl text-[10px] text-amber-900 font-semibold uppercase tracking-wide">
                  🎯 Arbre témoin associé : <span className="font-black">{UBELKA_TREES.find(t => t.speciesId === ligneuseSpeciesId)?.label}</span>
                </div>
              )}

              {/* PHENOLOGICAL MATRIX TABLE */}
              <div className="space-y-3">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  Tableau des Stades Phénologiques :
                </label>

                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-50/50 border-b border-emerald-100 text-[9.5px] uppercase font-mono text-emerald-950 font-black">
                        <th className="py-2.5 px-3">Stade</th>
                        <th className="py-2.5 px-2 text-center">Début (~10%)</th>
                        <th className="py-2.5 px-2 text-center">Plein (~50%)</th>
                        <th className="py-2.5 px-3">Commentaires / Observations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* FEUILLAISON */}
                      <tr className="border-b border-slate-50 hover:bg-slate-50/30">
                        <td className="py-3 px-3 font-bold text-slate-800">🍃 Feuillaison</td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setFeuillaisonDebut(true)}
                              className={`px-2.5 py-1 transition-all ${feuillaisonDebut ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeuillaisonDebut(false)}
                              className={`px-2.5 py-1 transition-all ${!feuillaisonDebut ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setFeuillaisonPlein(true)}
                              className={`px-2.5 py-1 transition-all ${feuillaisonPlein ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeuillaisonPlein(false)}
                              className={`px-2.5 py-1 transition-all ${!feuillaisonPlein ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="ex: bourgeons ouverts..."
                            value={feuillaisonComm}
                            onChange={(e) => setFeuillaisonComm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-[11px] focus:bg-white focus:border-emerald-300 outline-none"
                          />
                        </td>
                      </tr>

                      {/* FLORAISON */}
                      <tr className="border-b border-slate-50 hover:bg-slate-50/30">
                        <td className="py-3 px-3 font-bold text-slate-800">🌸 Floraison</td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setFloraisonDebut(true)}
                              className={`px-2.5 py-1 transition-all ${floraisonDebut ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setFloraisonDebut(false)}
                              className={`px-2.5 py-1 transition-all ${!floraisonDebut ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setFloraisonPlein(true)}
                              className={`px-2.5 py-1 transition-all ${floraisonPlein ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setFloraisonPlein(false)}
                              className={`px-2.5 py-1 transition-all ${!floraisonPlein ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="ex: premières anthères..."
                            value={floraisonComm}
                            onChange={(e) => setFloraisonComm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-[11px] focus:bg-white focus:border-emerald-300 outline-none"
                          />
                        </td>
                      </tr>

                      {/* FRUCTIFICATION */}
                      <tr className="border-b border-slate-50 hover:bg-slate-50/30">
                        <td className="py-3 px-3 font-bold text-slate-800">🍒 Fructification</td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setFructificationDebut(true)}
                              className={`px-2.5 py-1 transition-all ${fructificationDebut ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setFructificationDebut(false)}
                              className={`px-2.5 py-1 transition-all ${!fructificationDebut ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setFructificationPlein(true)}
                              className={`px-2.5 py-1 transition-all ${fructificationPlein ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setFructificationPlein(false)}
                              className={`px-2.5 py-1 transition-all ${!fructificationPlein ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="ex: samares rousses..."
                            value={fructificationComm}
                            onChange={(e) => setFructificationComm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-[11px] focus:bg-white focus:border-emerald-300 outline-none"
                          />
                        </td>
                      </tr>

                      {/* SENESCENCE */}
                      <tr className="hover:bg-slate-50/30">
                        <td className="py-3 px-3 font-bold text-slate-800">🍂 Sénescence</td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setSenescenceDebut(true)}
                              className={`px-2.5 py-1 transition-all ${senescenceDebut ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setSenescenceDebut(false)}
                              className={`px-2.5 py-1 transition-all ${!senescenceDebut ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => setSenescencePlein(true)}
                              className={`px-2.5 py-1 transition-all ${senescencePlein ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setSenescencePlein(false)}
                              className={`px-2.5 py-1 transition-all ${!senescencePlein ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                            >
                              Non
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="ex: coloration d'automne..."
                            value={senescenceComm}
                            onChange={(e) => setSenescenceComm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-[11px] focus:bg-white focus:border-emerald-300 outline-none"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FICHE 2: ESPÈCE HERBACÉE */}
          {ficheType === 'herbacee' && (
            <div className={`bg-white border-2 border-emerald-100 shadow-sm space-y-5 ${isMobile ? "p-4 rounded-2xl" : "p-6 rounded-3xl"}`}>
              <div className="border-b-2 border-emerald-50 pb-3">
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Flower className="w-4 h-4 text-emerald-600" />
                  Fiche 2 – Espèce Herbacée
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Relevé des espèces fleuries au sol de la ripisylve.
                </p>
              </div>

              {/* Herbaceous Species Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  Nom de l'espèce herbacée :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={herbaceeSpeciesId}
                    onChange={(e) => setHerbaceeSpeciesId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-bold focus:bg-white focus:border-emerald-400 outline-none cursor-pointer transition-all"
                  >
                    {ODS_HERBACEOUS_SPECIES.map((s) => (
                      <option key={s.id} value={s.id}>{s.commonName} ({s.latinName})</option>
                    ))}
                    <option value="autre">Autre espèce herbacée...</option>
                  </select>

                  {herbaceeSpeciesId === 'autre' && (
                    <input
                      type="text"
                      required
                      placeholder="Saisir le nom commun de l'espèce..."
                      value={customHerbaceeSpecies}
                      onChange={(e) => setCustomHerbaceeSpecies(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-emerald-100 rounded-2xl px-4 py-3 text-xs font-sans font-semibold focus:bg-white focus:border-emerald-400 outline-none transition-all"
                    />
                  )}
                </div>
              </div>

              {/* Reference Location Zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  Zone d'observation :
                </label>
                <select
                  value={herbaceeZone}
                  onChange={(e) => setHerbaceeZone(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-bold focus:bg-white focus:border-emerald-400 outline-none cursor-pointer transition-all"
                >
                  <option value="20 m² autour du Frêne Individu #1">20 m² autour du Frêne Individu #1 (Passerelle)</option>
                  <option value="20 m² autour du Sureau Individu #2">20 m² autour du Sureau Individu #2 (Sentier héron)</option>
                  <option value="20 m² autour du Cornouiller Individu #3">20 m² autour du Cornouiller Individu #3 (Méandres)</option>
                  <option value="20 m² autour de l'Aulne Individu #4">20 m² autour de l'Aulne Individu #4 (Bord de l'eau)</option>
                </select>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Le protocole exige de délimiter un carré de 20m² autour de l'arbre.
                </p>
              </div>

              {/* Phenological questions */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                
                {/* Q1: Première fleur épanouie */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight block">Première fleur épanouie ?</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Y a-t-il au moins 1 fleur ouverte ?</span>
                  </div>
                  <div className="inline-flex rounded-xl overflow-hidden border border-slate-200 text-xs font-black shrink-0 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setPremiereFleurEpanouie(true)}
                      className={`px-4 py-2 transition-all ${premiereFleurEpanouie ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setPremiereFleurEpanouie(false)}
                      className={`px-4 py-2 transition-all ${!premiereFleurEpanouie ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                {/* Q2: Nombre approximatif */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                    Nombre approximatif de fleurs dans la zone :
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: environ 15 fleurs visibles, ou 'aucune'..."
                    value={nbFleursApproximatif}
                    onChange={(e) => setNbFleursApproximatif(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all"
                  />
                </div>

                {/* Q3: État des feuilles */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                    État des feuilles :
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['vertes', 'jaunies', 'absentes'] as const).map((state) => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => setEtatFeuilles(state)}
                        className={`py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                          etatFeuilles === state 
                            ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs' 
                            : 'bg-white hover:bg-slate-50 border-emerald-100 text-slate-600'
                        }`}
                      >
                        {state === 'vertes' && "🍃 Vertes"}
                        {state === 'jaunies' && "🍂 Jaunies"}
                        {state === 'absentes' && "❌ Absentes"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FICHE 3: ESPÈCE ANIMALE */}
          {ficheType === 'animale' && (
            <div className={`bg-white border-2 border-emerald-100 shadow-sm space-y-5 ${isMobile ? "p-4 rounded-2xl" : "p-6 rounded-3xl"}`}>
              <div className="border-b-2 border-emerald-50 pb-3">
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Bird className="w-4 h-4 text-emerald-600" />
                  Fiche 3 – Espèce Animale
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Surveillance de la faune aquatique et terrestre de l'Huveaune.
                </p>
              </div>

              {/* Animal Species Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  Nom de l'espèce animale :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={animaleSpeciesId}
                    onChange={(e) => setAnimaleSpeciesId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-bold focus:bg-white focus:border-emerald-400 outline-none cursor-pointer transition-all"
                  >
                    {ODS_ANIMAL_SPECIES.map((s) => (
                      <option key={s.id} value={s.id}>{s.commonName} ({s.latinName})</option>
                    ))}
                    <option value="autre">Autre espèce animale...</option>
                  </select>

                  {animaleSpeciesId === 'autre' && (
                    <input
                      type="text"
                      required
                      placeholder="Saisir le nom de l'animal repéré..."
                      value={customAnimaleSpecies}
                      onChange={(e) => setCustomAnimaleSpecies(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-emerald-100 rounded-2xl px-4 py-3 text-xs font-sans font-semibold focus:bg-white focus:border-emerald-400 outline-none transition-all"
                    />
                  )}
                </div>
              </div>

              {/* Fixed study zone info */}
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl text-[11px] text-sky-950 font-sans leading-relaxed">
                📍 <strong className="font-black">Zone d'observation :</strong> {animaleZone} (Périmètre d'écoute et d'affût de la ripisylve d'Auriol).
              </div>

              {/* Questions */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                
                {/* Q1: Première observation de l'adulte */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight block">Première observation de l’adulte ?</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Est-ce le premier retour printanier/saisonnier de l'espèce ?</span>
                  </div>
                  <div className="inline-flex rounded-xl overflow-hidden border border-slate-200 text-xs font-black shrink-0 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setPremiereObsAdulte(true)}
                      className={`px-4 py-2 transition-all ${premiereObsAdulte ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setPremiereObsAdulte(false)}
                      className={`px-4 py-2 transition-all ${!premiereObsAdulte ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                {/* Q2: Nombre approximatif d'individus */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                    Nombre d’individus approximatif :
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1 adulte posé, un couple en vol, traces de pattes..."
                    value={nbIndividusApproximatif}
                    onChange={(e) => setNbIndividusApproximatif(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-sans font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all"
                  />
                </div>

                {/* Q3: Comportement */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                    Comportement observé :
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: En train de nager à contre-courant, de chasser des insectes, cris entendus..."
                    value={comportementObserve}
                    onChange={(e) => setComportementObserve(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-xs focus:bg-white outline-none focus:border-emerald-400 font-sans font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMMON REMARKS AND SUBMIT BOX */}
          <div className={`bg-white border-2 border-emerald-100 shadow-sm space-y-4 ${isMobile ? "p-4 rounded-2xl" : "p-6 rounded-3xl"}`}>
            <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b-2 border-emerald-50 pb-2.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Remarques de terrain & Commentaires libres
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-emerald-950 block">
                Remarques additionnelles :
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Température clémente, vent fort soufflant du nord, berges glissantes après la crue..."
                value={remarques}
                onChange={(e) => setRemarques(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-xs focus:bg-white outline-none focus:border-emerald-400 font-sans font-medium transition-all"
              />
            </div>

            {/* Submit Box */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-xs py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-700"
              >
                <CheckCircle className="w-4 h-4" />
                Enregistrer la Fiche de Saisie Numérique
              </button>
              
              <button
                type="button"
                onClick={handlePrintFormPDF}
                className="w-full bg-white hover:bg-emerald-50 border-2 border-emerald-200 text-emerald-900 font-black uppercase tracking-wider text-xs py-3.5 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                Exporter la fiche active en PDF (Brouillon)
              </button>
            </div>
          </div>

        </div>
      </form>
      </div>

      {/* 
        PRINTABLE SINGLE SHEET VIEW (PDF EXPORT FOR ACTIVE FORM)
        - Only rendered when window.print() is executed (print:block)
      */}
      <div className="hidden print:block bg-white text-black p-4 font-sans max-w-4xl mx-auto">
        <div className="border-4 border-emerald-800 p-8 rounded-3xl max-w-2xl mx-auto my-4 space-y-6">
          <div className="flex justify-between items-center border-b-2 border-emerald-100 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 font-sans">Observatoire des Saisons Provence</span>
              <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-tight font-sans mt-1">Fiche de Saisie Active (Brouillon)</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Collège Ubelka, Auriol • Projet Ripisylve</p>
            </div>
            <div className="text-right text-xs text-slate-500 font-bold uppercase">
              <div className="bg-emerald-50 text-emerald-950 font-black px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider inline-block">SORTIE {activeTripType.toUpperCase()}</div>
              <div className="mt-1.5 text-[10px]">Date du relevé : {date}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="text-[9px] uppercase font-mono text-slate-400 font-black">Groupe d'élèves</h3>
              <p className="font-black text-slate-950 text-sm uppercase">{groupName}</p>
            </div>
            <div>
              <h3 className="text-[9px] uppercase font-mono text-slate-400 font-black">Espèce observée</h3>
              <p className="font-black text-emerald-950 text-sm uppercase">{getSelectedSpeciesName()}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {ficheType === 'ligneuse' ? "🌳 Espèce Ligneuse" : ficheType === 'herbacee' ? "🌱 Espèce Herbacée" : "🐌 Espèce Animale"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 space-y-3.5 text-xs">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">Données & Constats Phénologiques</h4>
            {ficheType === 'ligneuse' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-bold block text-slate-800">🍃 Feuillaison</span>
                  <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{feuillaisonDebut ? 'Oui' : 'Non'}</strong></span>
                  <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{feuillaisonPlein ? 'Oui' : 'Non'}</strong></span>
                  {feuillaisonComm && <p className="text-[10px] text-slate-500 italic">"{feuillaisonComm}"</p>}
                </div>
                <div className="space-y-1">
                  <span className="font-bold block text-slate-800">🌸 Floraison</span>
                  <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{floraisonDebut ? 'Oui' : 'Non'}</strong></span>
                  <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{floraisonPlein ? 'Oui' : 'Non'}</strong></span>
                  {floraisonComm && <p className="text-[10px] text-slate-500 italic">"{floraisonComm}"</p>}
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-150">
                  <span className="font-bold block text-slate-800">🍒 Fructification</span>
                  <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{fructificationDebut ? 'Oui' : 'Non'}</strong></span>
                  <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{fructificationPlein ? 'Oui' : 'Non'}</strong></span>
                  {fructificationComm && <p className="text-[10px] text-slate-500 italic">"{fructificationComm}"</p>}
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-150">
                  <span className="font-bold block text-slate-800">🍂 Sénescence</span>
                  <span className="block font-medium">Début (~10%) : <strong className="font-black text-emerald-900">{senescenceDebut ? 'Oui' : 'Non'}</strong></span>
                  <span className="block font-medium">Plein (~50%) : <strong className="font-black text-emerald-900">{senescencePlein ? 'Oui' : 'Non'}</strong></span>
                  {senescenceComm && <p className="text-[10px] text-slate-500 italic">"{senescenceComm}"</p>}
                </div>
              </div>
            ) : ficheType === 'herbacee' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Première fleur épanouie :</span>
                  <span className="font-black text-slate-900 text-sm">{premiereFleurEpanouie ? 'OUI' : 'NON'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">État des feuilles :</span>
                  <span className="font-black text-slate-900 text-sm uppercase">{etatFeuilles}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-150">
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Nombre approximatif de fleurs :</span>
                  <span className="font-black text-slate-900">{nbFleursApproximatif || 'Non indiqué'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Zone d'étude de la station :</span>
                  <span className="font-black text-slate-800 text-[11px]">{herbaceeZone || 'Station zone humide'}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Première observation adulte :</span>
                  <span className="font-black text-slate-900 text-sm">{premiereObsAdulte ? 'OUI' : 'NON'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Nombre estimé d'individus :</span>
                  <span className="font-black text-slate-900 text-sm">{nbIndividusApproximatif || '1'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-150">
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Comportement observé :</span>
                  <p className="font-medium text-slate-800 leading-relaxed bg-white border border-slate-200 p-2.5 rounded-lg italic">
                    "{comportementObserve || 'Aucun comportement particulier signalé.'}"
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Zone d'observation :</span>
                  <span className="font-black text-slate-850">{animaleZone || 'Périmètre station de 3 km²'}</span>
                </div>
              </div>
            )}
          </div>

          {remarques && (
            <div className="space-y-1">
              <h4 className="text-[9px] uppercase font-mono text-slate-400 font-black">Remarques et notes de terrain</h4>
              <p className="text-xs text-slate-800 italic bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl font-medium leading-relaxed">
                "{remarques}"
              </p>
            </div>
          )}

          {capturedPhotoUrl && (
            <div className="pt-2">
              <span className="text-[9px] text-slate-400 italic font-medium block">
                📎 Photo de confirmation capturée au cours de la sortie et archivée avec cette fiche de saisie.
              </span>
            </div>
          )}

          <div className="text-center text-[9px] text-slate-450 font-black uppercase tracking-wider mt-12 border-t-2 border-slate-100 pt-5">
            Document généré en direct depuis le portail Sentinelles de la Ripisylve
            <div className="mt-1 font-mono text-[8px] text-slate-400">Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
        </div>
      </div>
    </>
  );
}
