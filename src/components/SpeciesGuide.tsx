import React, { useState } from 'react';
import { ODS_SPECIES, PREDEFINED_PHOTOS, getStageImageUrl } from '../data';
import { Species, PhenologicalStage } from '../types';
import { Leaf, Eye, Apple, Info, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface SpeciesGuideProps {
  isMobile?: boolean;
}

export default function SpeciesGuide({ isMobile = false }: SpeciesGuideProps) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('frene');
  const [selectedCategory, setSelectedCategory] = useState<'feuilles' | 'fleurs' | 'fruits'>('feuilles');
  const [simulationSeason, setSimulationSeason] = useState<'automne' | 'hiver' | 'printemps'>('printemps');

  const selectedSpecies = ODS_SPECIES.find(s => s.id === selectedSpeciesId) || ODS_SPECIES[0];

  const getStagesForCategory = () => {
    switch (selectedCategory) {
      case 'feuilles': return selectedSpecies.leafStages;
      case 'fleurs': return selectedSpecies.flowerStages;
      case 'fruits': return selectedSpecies.fruitStages;
      default: return [];
    }
  };

  const getCategoryIcon = (cat: 'feuilles' | 'fleurs' | 'fruits', isSelected: boolean) => {
    switch (cat) {
      case 'feuilles': return <Leaf className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />;
      case 'fleurs': return <Eye className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-rose-500'}`} />;
      case 'fruits': return <Apple className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-amber-500'}`} />;
    }
  };

  // Predefined custom mock drawings/images or explanations for species based on season
  const getSpeciesSeasonImage = (speciesId: string, season: 'automne' | 'hiver' | 'printemps') => {
    if (season === 'automne') {
      return getStageImageUrl(speciesId, 'senescence');
    }
    if (season === 'printemps') {
      return getStageImageUrl(speciesId, 'feuillaison');
    }
    // Hiver utilise l'image sans feuilles d'Unsplash
    const keyMap: Record<string, string> = {
      'frene-hiver': 'frene_hiver_nu',
      'sureau-hiver': 'sureau_hiver_nu',
      'bouleau-hiver': 'bouleau_hiver_nu',
      'robinier-hiver': 'frene_hiver_nu',
      'noyer-hiver': 'noyer_hiver_nu',
      'noisetier-hiver': 'frene_hiver_nu'
    };
    const key = `${speciesId}-${season}`;
    const photoKey = keyMap[key];
    if (photoKey && PREDEFINED_PHOTOS[photoKey]) {
      return PREDEFINED_PHOTOS[photoKey].url;
    }
    return 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=400';
  };

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-12 gap-6"}>
      {/* Species Selector Sidebar (4 cols) */}
      <div className={isMobile ? "space-y-3" : "lg:col-span-4 space-y-4"}>
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 px-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-emerald-400 rounded-full"></span>
          Espèces de la Ripisylve
        </h3>
        <div className={isMobile ? "flex flex-row overflow-x-auto gap-2 pb-2 scrollbar-none snap-x" : "flex flex-col gap-3"}>
          {ODS_SPECIES.map((spec) => {
            const isSelected = spec.id === selectedSpeciesId;
            return (
              <button
                key={spec.id}
                onClick={() => {
                  setSelectedSpeciesId(spec.id);
                  setSelectedCategory('feuilles');
                }}
                className={`text-left border-2 transition-all flex flex-col shrink-0 snap-center ${
                  isMobile 
                    ? `w-[160px] p-3 rounded-2xl gap-1 ${isSelected ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/10' : 'bg-white border-emerald-100'}` 
                    : `w-full p-4 rounded-3xl gap-1.5 ${isSelected ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/10' : 'bg-white hover:bg-emerald-50/40 border-emerald-100'}`
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-black text-sm text-emerald-950 uppercase tracking-tight">{spec.commonName}</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{spec.family}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 italic font-medium truncate w-full">
                  {spec.latinName}
                </div>
                {!isMobile && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {spec.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Season Simulator for Training */}
        <div className={`bg-emerald-600 border-2 border-emerald-700 text-white shadow-md ${isMobile ? "p-4 rounded-2xl" : "p-5 rounded-3xl"}`}>
          <h4 className="font-black text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-200 animate-pulse" />
            Silhouette par Saison
          </h4>
          <p className="text-[10.5px] text-emerald-100 leading-relaxed mb-3.5 font-medium">
            Sélectionne une saison pour prévisualiser l'aspect de l'arbre témoin avant de partir sur le terrain.
          </p>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-emerald-750/50 rounded-xl text-xs font-bold text-white mb-3.5">
            <button 
              onClick={() => setSimulationSeason('automne')}
              className={`py-1.5 rounded-lg text-center transition-all ${simulationSeason === 'automne' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'hover:bg-white/10'}`}
            >
              Automne
            </button>
            <button 
              onClick={() => setSimulationSeason('hiver')}
              className={`py-1.5 rounded-lg text-center transition-all ${simulationSeason === 'hiver' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'hover:bg-white/10'}`}
            >
              Hiver
            </button>
            <button 
              onClick={() => setSimulationSeason('printemps')}
              className={`py-1.5 rounded-lg text-center transition-all ${simulationSeason === 'printemps' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'hover:bg-white/10'}`}
            >
              Printemps
            </button>
          </div>
          
          <div className="relative h-44 rounded-2xl overflow-hidden shadow-xs border-2 border-emerald-500/35">
            <img 
              src={getSpeciesSeasonImage(selectedSpecies.id, simulationSeason)} 
              alt="Season simulation" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-emerald-950/90 p-3 text-[10.5px] text-white">
              <div className="font-black uppercase tracking-wider">{selectedSpecies.commonName}</div>
              <div className="text-emerald-200 mt-0.5 leading-tight text-[10px]">
                Sortie de {simulationSeason === 'automne' ? 'mi-novembre' : simulationSeason === 'hiver' ? 'fin-janvier' : 'début-avril'}.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Species Details & ODS Protocol Stages (8 cols) */}
      <div className={isMobile ? "bg-white rounded-2xl border-2 border-emerald-100 shadow-sm p-4 space-y-4" : "lg:col-span-8 bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-6 sm:p-8 space-y-6"}>
        {/* Header containing name and biological role */}
        <div className={`border-b border-emerald-100 ${isMobile ? "pb-3" : "pb-5"}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className={`font-sans font-black text-emerald-950 uppercase tracking-tight ${isMobile ? "text-lg" : "text-2xl"}`}>
                {selectedSpecies.commonName}
              </h2>
              <p className="text-xs text-slate-500 font-mono italic mt-0.5 font-semibold">
                {selectedSpecies.latinName} — Famille des {selectedSpecies.family}
              </p>
            </div>
            <div className="text-[10px] bg-amber-100 text-amber-700 font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-200">
              Espèce ODS Provence
            </div>
          </div>

          <div className={isMobile ? "space-y-2 mt-2.5 text-xs font-sans" : "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-sans"}>
            <div className={`space-y-1 bg-emerald-50/20 border-2 border-emerald-100/60 ${isMobile ? "p-3 rounded-xl" : "p-4 rounded-2xl"}`}>
              <h4 className="font-bold text-emerald-950 text-[10px] flex items-center gap-1.5 uppercase tracking-wider mb-1">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                Habitat & Localisation
              </h4>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                {selectedSpecies.habitat}
              </p>
            </div>
            <div className={`space-y-1 bg-sky-50/20 border-2 border-sky-100/60 ${isMobile ? "p-3 rounded-xl" : "p-4 rounded-2xl"}`}>
              <h4 className="font-bold text-sky-950 text-[10px] flex items-center gap-1.5 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                Rôle écologique
              </h4>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                {selectedSpecies.importance}
              </p>
            </div>
          </div>
        </div>

        {/* Phenological stages catalog */}
        <div className={isMobile ? "space-y-3" : "space-y-4"}>
          <div className={`flex flex-col gap-2 ${isMobile ? "" : "sm:flex-row sm:items-center justify-between"}`}>
            <h3 className="font-sans font-black text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-400 rounded-full"></span>
              Protocoles ODS : Identification des stades
            </h3>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {(['feuilles', 'fleurs', 'fruits'] as const).map((cat) => {
              const isSelected = cat === selectedCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center transition-all shrink-0 border-2 ${
                    isMobile 
                      ? `gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${isSelected ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-white border-emerald-100 text-emerald-800'}`
                      : `gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider ${isSelected ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100' : 'bg-white hover:bg-emerald-50 border-emerald-100 text-emerald-800'}`
                  }`}
                >
                  {getCategoryIcon(cat, isSelected)}
                  {cat === 'feuilles' ? 'Feuillage' : cat === 'fleurs' ? 'Floraison' : 'Fruits'}
                </button>
              );
            })}
          </div>

          {/* Section d'images de référence locales */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex flex-col gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Photo de référence terrain — ${selectedCategory === 'feuilles' ? 'Feuillage & Sénescence' : selectedCategory === 'fleurs' ? 'Floraison' : 'Fructification'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCategory === 'feuilles' ? (
                <>
                  <div className="space-y-1">
                    <div className="relative h-44 rounded-xl overflow-hidden border border-emerald-250/60 shadow-xs">
                      <img 
                        src={getStageImageUrl(selectedSpecies.id, 'feuillaison')} 
                        alt="Feuillaison" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600/90 text-white font-black uppercase tracking-wider text-[8px] rounded">
                        Feuillaison (Printemps)
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 italic text-center leading-tight">
                      Stades F1 (débourrement) et F2 (feuilles étalées).
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="relative h-44 rounded-xl overflow-hidden border border-emerald-250/60 shadow-xs">
                      <img 
                        src={getStageImageUrl(selectedSpecies.id, 'senescence')} 
                        alt="Sénescence" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600/90 text-white font-black uppercase tracking-wider text-[8px] rounded">
                        Sénescence (Automne)
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 italic text-center leading-tight">
                      Stades F3 (coloration) et F4 (chute des feuilles).
                    </p>
                  </div>
                </>
              ) : selectedCategory === 'fleurs' ? (
                <div className="col-span-1 sm:col-span-2 max-w-sm mx-auto w-full space-y-1">
                  <div className="relative h-44 rounded-xl overflow-hidden border border-emerald-250/60 shadow-xs">
                    <img 
                      src={getStageImageUrl(selectedSpecies.id, 'floraison')} 
                      alt="Floraison" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600/90 text-white font-black uppercase tracking-wider text-[8px] rounded">
                      Floraison (Printemps)
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 italic text-center leading-tight">
                    Fleurs épanouies (Fl1, Fl2) et fin floraison (Fl3).
                  </p>
                </div>
              ) : (
                <div className="col-span-1 sm:col-span-2 max-w-sm mx-auto w-full space-y-1">
                  <div className="relative h-44 rounded-xl overflow-hidden border border-emerald-250/60 shadow-xs">
                    <img 
                      src={getStageImageUrl(selectedSpecies.id, 'fructification')} 
                      alt="Fructification" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500/90 text-white font-black uppercase tracking-wider text-[8px] rounded">
                      Fructification (Fin été / Automne)
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 italic text-center leading-tight">
                    Jeunes fruits (Fr1), maturité (Fr2) et dissémination (Fr3).
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* Stages list under selected category */}
          <div className={isMobile ? "grid grid-cols-1 gap-2.5 pt-1" : "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"}>
            {getStagesForCategory().map((stage: PhenologicalStage) => (
              <div 
                key={stage.code}
                className={`border-2 border-emerald-100 hover:border-emerald-300 bg-emerald-50/10 flex items-start transition-all ${
                  isMobile ? "rounded-xl p-3 gap-3" : "rounded-2xl p-4.5 gap-4.5"
                }`}
              >
                {/* Code badge in green circular format */}
                <div className={`${isMobile ? "w-8 h-8 text-[10px]" : "w-10 h-10 text-xs"} rounded-full bg-emerald-100 text-emerald-900 font-mono font-black flex items-center justify-center shrink-0 border-2 border-emerald-200 shadow-sm`}>
                  {stage.code}
                </div>
                <div className={isMobile ? "space-y-1 grow" : "space-y-1.5 grow"}>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap uppercase tracking-wider">
                    {stage.name}
                  </h4>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans font-medium">
                    {stage.description}
                  </p>
                  <div className={`border-t border-emerald-100/50 text-emerald-800 font-sans bg-emerald-50/40 border border-emerald-100/30 ${
                    isMobile ? "mt-1 pt-1 p-2 rounded-lg text-[9.5px]" : "mt-2 pt-2 p-2.5 rounded-xl text-[10.5px]"
                  }`}>
                    <span className="font-black uppercase tracking-wider text-[9px] block text-emerald-950 mb-0.5">Conseil de terrain :</span>
                    {stage.tips}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informative footnote for 6ème */}
        <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-3 leading-relaxed font-sans font-medium">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-emerald-950 uppercase tracking-wider text-[10px] block mb-0.5">Règle d'or de l'observateur ODS :</span> Un stade est considéré comme atteint si le phénomène (par exemple, le débourrement F1) est visible sur au moins trois endroits différents de la plante ou de l'arbre observé. Cela évite d'enregistrer une exception locale comme règle générale !
          </div>
        </div>
      </div>
    </div>
  );
}
