import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TreeDeciduous, 
  MapPin, 
  Award, 
  Calendar, 
  Database, 
  Sprout, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Compass, 
  BookOpen, 
  ExternalLink,
  Smartphone,
  Sparkles,
  CloudUpload
} from 'lucide-react';

import { TripType, Observation, getCurrentTripType } from './types';
import { INITIAL_OBSERVATIONS, ODS_SPECIES, UBELKA_TREES } from './data';

import HuveauneMap from './components/HuveauneMap';
import PedagogicalGuide from './components/PedagogicalGuide';
import SpeciesGuide from './components/SpeciesGuide';
import ObservationForm from './components/ObservationForm';
import DataDashboard from './components/DataDashboard';
import SheetSyncPanel, { SyncStatus } from './components/SheetSyncPanel';
import {
  OdsSheetsConfig,
  SyncResult,
  loadSheetsConfig,
  saveSheetsConfig,
  isSheetsConfigured,
  syncObservations,
  testSheetsConnection,
  rebuildExportSheet
} from './lib/odsSheets';

const CACHE_KEY = 'ubelka_ods_observations_v3';

export default function App() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'accueil' | 'pedago' | 'especes' | 'saisie' | 'dashboard' | 'sheets'>('accueil');
  
  // Sortie active : déduite de la date du jour (et modifiable à la main).
  // Avant, la valeur était figée sur "printemps" : les fiches saisies en
  // septembre étaient rangées dans la mauvaise sortie du carnet.
  const [activeTripType, setActiveTripType] = useState<TripType>(() => getCurrentTripType());

  // Mobile Application view mode simulation
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'saisie' | 'carte' | 'especes' | 'releves'>('saisie');

  // Observations database stored in localStorage
  const [observations, setObservations] = useState<Observation[]>([]);

  // Liaison Google Sheets (configuration du pont Apps Script)
  const [sheetsConfig, setSheetsConfig] = useState<OdsSheetsConfig>(() => loadSheetsConfig());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ kind: 'idle', message: '' });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load observations from localStorage or initialize with empty data
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setObservations(JSON.parse(cached));
      } catch (e) {
        setObservations([]);
      }
    } else {
      setObservations([]);
    }
  }, []);

  // Sync back to localStorage whenever observations update
  const saveObservationsToCache = (newObs: Observation[]) => {
    setObservations(newObs);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newObs));
  };

  /* ------------------------------------------------------------------ */
  /*  Synchronisation Google Sheets                                      */
  /* ------------------------------------------------------------------ */

  const updateSheetsConfig = (config: OdsSheetsConfig) => {
    setSheetsConfig(config);
    saveSheetsConfig(config);
  };

  // Applique le résultat d'un envoi : horodatage ou message d'erreur
  const applySyncResult = (ids: string[], result: SyncResult) => {
    const stamp = new Date().toISOString();
    setObservations(prev => {
      const next = prev.map(obs =>
        ids.includes(obs.id)
          ? result.ok
            ? { ...obs, isSubmitted: true, syncedAt: stamp, syncError: undefined }
            : { ...obs, syncError: result.message }
          : obs
      );
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      return next;
    });
    setSyncStatus({
      kind: result.ok ? 'ok' : 'error',
      message: result.message,
      at: stamp
    });
  };

  // Envoie une liste de fiches vers le Google Sheet
  const runSync = async (targets: Observation[]) => {
    if (!targets.length) {
      setSyncStatus({ kind: 'error', message: 'Aucune fiche à envoyer vers Google Sheets.' });
      return;
    }
    setIsSyncing(true);
    setSyncStatus({
      kind: 'running',
      message: `Envoi de ${targets.length} fiche${targets.length > 1 ? 's' : ''} vers le Google Sheet…`
    });
    try {
      const result = await syncObservations(targets, sheetsConfig);
      applySyncResult(targets.map(t => t.id), result);
    } finally {
      setIsSyncing(false);
    }
  };

  // Envoie toutes les fiches qui n'ont jamais été synchronisées
  const handleSyncPending = () => runSync(observations.filter(obs => !obs.syncedAt));

  // Envoie une seule fiche
  const handleSyncOne = (id: string) => runSync(observations.filter(obs => obs.id === id));

  // Test de connexion au tableur
  const handleTestSheets = async () => {
    setIsSyncing(true);
    setSyncStatus({ kind: 'running', message: 'Test de la connexion au Google Sheet…' });
    try {
      const result = await testSheetsConnection(sheetsConfig);
      setSyncStatus({
        kind: result.ok ? 'ok' : 'error',
        message: result.message,
        at: new Date().toISOString()
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Régénération de l'onglet d'export ODS
  const handleRebuildExport = async () => {
    setIsSyncing(true);
    setSyncStatus({ kind: 'running', message: "Reconstruction de l'onglet d'export ODS…" });
    try {
      const result = await rebuildExportSheet(sheetsConfig);
      setSyncStatus({
        kind: result.ok ? 'ok' : 'error',
        message: result.message,
        at: new Date().toISOString()
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Add observation
  const handleSaveObservation = (obsData: Omit<Observation, 'id' | 'isSubmitted'>) => {
    const newRecord: Observation = {
      ...obsData,
      id: `obs-${Date.now()}`,
      isSubmitted: false
    };
    const updated = [newRecord, ...observations];
    saveObservationsToCache(updated);

    // Envoi automatique vers le Google Sheet si la liaison est active
    if (sheetsConfig.autoSync && isSheetsConfigured(sheetsConfig)) {
      void runSync([newRecord]);
    }
  };

  // Delete observation
  const handleDeleteObservation = (id: string) => {
    const updated = observations.filter(obs => obs.id !== id);
    saveObservationsToCache(updated);
  };

  // Clear all observations (reset to empty)
  const handleClearAll = () => {
    saveObservationsToCache([]);
  };

  // Mark an observation as submitted to the ODS server
  const handleMarkSubmitted = (id: string) => {
    const updated = observations.map(obs => {
      if (obs.id === id) {
        return { ...obs, isSubmitted: true };
      }
      return obs;
    });
    saveObservationsToCache(updated);
  };

  return (
    <>
      {isMobileMode ? (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 py-8 antialiased selection:bg-emerald-200 selection:text-emerald-900">
          {/* Top Control Bar to exit mobile mode */}
          <div className="w-full max-w-sm flex items-center justify-between mb-4 text-slate-400 text-xs px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-slate-100 font-extrabold uppercase tracking-wider text-[10px]">Simulateur Smartphone 6ème</span>
            </div>
            <button 
              onClick={() => setIsMobileMode(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-100 font-black rounded-lg hover:bg-slate-700 transition-all border border-slate-700 uppercase tracking-widest text-[9px] cursor-pointer"
            >
              Quitter le Mode Mobile
            </button>
          </div>

          {/* Smartphone Shell Frame */}
          <div className="relative w-full max-w-[390px] h-[780px] bg-slate-950 rounded-[48px] border-[10px] border-slate-800 shadow-2xl flex flex-col overflow-hidden ring-4 ring-slate-700 ring-offset-4 ring-offset-slate-900">
            
            {/* Top Speaker / Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-16 h-1 bg-slate-800 rounded-full mb-1"></div>
            </div>

            {/* Phone Status Bar */}
            <div className="bg-emerald-950 text-emerald-100 px-6 pt-7 pb-2 text-[10px] font-bold flex justify-between items-center shrink-0 z-40 select-none">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>📶 5G</span>
                <span>🔋 98%</span>
              </div>
            </div>

            {/* Seasonal Trip Active Banner inside mobile */}
            <div className="bg-emerald-900 text-white px-4 py-2.5 text-xs flex justify-between items-center shrink-0 border-b border-emerald-800 font-sans">
              <span className="font-extrabold tracking-tight">🎒 Sortie active : {activeTripType.toUpperCase()}</span>
              <select
                value={activeTripType}
                onChange={(e) => setActiveTripType(e.target.value as TripType)}
                className="bg-emerald-800 text-[10px] text-white font-bold rounded px-1.5 py-0.5 border border-emerald-700 outline-none cursor-pointer"
              >
                <option value="automne">Automne</option>
                <option value="hiver">Hiver</option>
                <option value="printemps">Printemps</option>
              </select>
            </div>

            {/* Smartphone Screen Scrollable Body */}
            <div className="grow overflow-y-auto bg-emerald-50 px-3 py-4 scrollbar-thin">
              <motion.div
                key={mobileTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-24"
              >
                {mobileTab === 'saisie' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
                      <h2 className="font-sans font-black text-base text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        Fiche de Saisie Terrain
                      </h2>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
                        Sélectionnez votre groupe d'élèves, puis complétez votre fiche d'observation en direct.
                      </p>
                    </div>

                    <ObservationForm 
                      activeTripType={activeTripType}
                      onSaveObservation={(newObs) => {
                        handleSaveObservation(newObs);
                        alert("Observation de terrain enregistrée !");
                        setMobileTab('releves');
                      }}
                      isMobile={true}
                    />
                  </div>
                )}

                {mobileTab === 'carte' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
                      <h2 className="font-sans font-black text-base text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-600" />
                        Carte de l'Ubelka
                      </h2>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
                        Repérez le collège Ubelka, le rond-point et le cours de l'Huveaune. Vous pouvez faire glisser les arbres si le mode déplacement est activé !
                      </p>
                    </div>

                    <HuveauneMap 
                      onSelectTree={(treeId) => {
                        setMobileTab('especes');
                      }}
                      isMobile={true}
                    />
                  </div>
                )}

                {mobileTab === 'especes' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
                      <h2 className="font-sans font-black text-base text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        Guide d'Identification
                      </h2>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
                        Consultez la fiche d'identité des 4 espèces cibles pour valider vos relevés.
                      </p>
                    </div>

                    <SpeciesGuide isMobile={true} />
                  </div>
                )}

                {mobileTab === 'releves' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
                      <h2 className="font-sans font-black text-base text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-emerald-600" />
                        Carnet de Classe
                      </h2>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
                        Historique des données saisies localement. Prêt à soumettre à l'ODS.
                      </p>
                    </div>

                    <DataDashboard 
                      observations={observations}
                      onDeleteObservation={handleDeleteObservation}
                      onClearAll={handleClearAll}
                      onMarkSubmitted={handleMarkSubmitted}
                      sheetsEnabled={isSheetsConfigured(sheetsConfig)}
                      isSyncing={isSyncing}
                      onSyncOne={handleSyncOne}
                      onSyncAll={handleSyncPending}
                      isMobile={true}
                    />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Smartphone Bottom Navigation Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 pt-2.5 pb-6 px-3 flex justify-around items-center z-40 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.03)] h-[74px]">
              {(['saisie', 'carte', 'especes', 'releves'] as const).map((tab) => {
                const isActive = mobileTab === tab;
                const getIcon = () => {
                  switch (tab) {
                    case 'saisie': return <Calendar className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />;
                    case 'carte': return <Compass className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />;
                    case 'especes': return <Sprout className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />;
                    case 'releves': return <Database className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />;
                  }
                };
                const getLabel = () => {
                  switch (tab) {
                    case 'saisie': return 'Saisie';
                    case 'carte': return 'Carte';
                    case 'especes': return 'Guide';
                    case 'releves': return 'Relevés';
                  }
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setMobileTab(tab)}
                    className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden min-w-[64px]"
                  >
                    {/* Active highlight background pill */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeMobileTabIndicator"
                        className="absolute inset-0 bg-emerald-100/70 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <div className="mb-0.5 transition-transform duration-200">
                      {getIcon()}
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${
                      isActive ? 'text-emerald-950 font-black scale-105' : 'text-slate-500'
                    }`}>
                      {getLabel()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Home Indicator bar */}
            <div className="absolute bottom-1.5 w-28 h-1 left-1/2 -translate-x-1/2 bg-slate-300/80 rounded-full z-50"></div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-emerald-50 text-slate-800 antialiased selection:bg-emerald-200 selection:text-emerald-900 pb-16">
          {/* Upper Brand Utility Line */}
          <div className="bg-emerald-950 text-emerald-100 py-2.5 px-4 sm:px-8 border-b border-emerald-900 text-[10.5px] flex justify-between items-center font-sans print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Espace Pédagogique Numérique — Académie d'Aix-Marseille</span>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.obs-saisons.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                obs-saisons.fr
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

      {/* Main Educational Banner / Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4 print:hidden">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center bg-white p-6 rounded-3xl shadow-sm border-2 border-emerald-100 gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
              ODS
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500 font-sans block">Observatoire des Saisons Provence</span>
              <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-tight leading-none mt-1">
                Sentinelles de la Ripisylve
              </h1>
              <p className="text-emerald-600 font-semibold text-sm mt-1">
                Collège Ubelka, Auriol • Zone Humide des Méandres de l'Huveaune
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3.5 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 shadow-xs flex items-center justify-center">
                Niveau 6ème
              </div>
              
              <button
                onClick={() => {
                  setIsMobileMode(true);
                  setMobileTab('saisie');
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black border-2 border-rose-700 shadow-md flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider animate-bounce"
                title="Basculer vers l'interface mobile pour saisie terrain"
              >
                <Smartphone className="w-3.5 h-3.5" />
                📱 Mode App Mobile
              </button>

              <div className="px-3.5 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200 shadow-xs flex items-center justify-center">
                Projet ODS Provence
              </div>
            </div>

            {/* Simulated seasonal trip controller */}
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-3 flex flex-col gap-1.5 min-w-[210px] shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-sans">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Sortie active :
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded font-mono uppercase">
                  {activeTripType}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-emerald-100/50 rounded-lg text-[11px] font-bold text-emerald-800">
                <button
                  onClick={() => setActiveTripType('automne')}
                  className={`py-1 rounded-md text-center transition-all ${
                    activeTripType === 'automne' 
                      ? 'bg-white text-amber-800 shadow-xs' 
                      : 'hover:text-emerald-950'
                  }`}
                >
                  Automne
                </button>
                <button
                  onClick={() => setActiveTripType('hiver')}
                  className={`py-1 rounded-md text-center transition-all ${
                    activeTripType === 'hiver' 
                      ? 'bg-white text-sky-800 shadow-xs' 
                      : 'hover:text-emerald-950'
                  }`}
                >
                  Hiver
                </button>
                <button
                  onClick={() => setActiveTripType('printemps')}
                  className={`py-1 rounded-md text-center transition-all ${
                    activeTripType === 'printemps' 
                      ? 'bg-white text-emerald-950 shadow-xs' 
                      : 'hover:text-emerald-950'
                  }`}
                >
                  Printemps
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Tabbed Navigation */}
      <div className="bg-emerald-50/80 backdrop-blur-md sticky top-0 z-40 py-3 border-b border-emerald-100/60 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <nav className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('accueil')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 border-2 ${
                activeTab === 'accueil'
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50/60 shadow-xs'
              }`}
            >
              Accueil & Carte
            </button>
            <button
              onClick={() => setActiveTab('pedago')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 border-2 ${
                activeTab === 'pedago'
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50/60 shadow-xs'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Activité & Compétences
            </button>
            <button
              onClick={() => setActiveTab('especes')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 border-2 ${
                activeTab === 'especes'
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50/60 shadow-xs'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              Guide des Espèces
            </button>
            <button
              onClick={() => setActiveTab('saisie')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 border-2 ${
                activeTab === 'saisie'
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50/60 shadow-xs'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Fiches de Saisie (Relevés)
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 border-2 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50/60 shadow-xs'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Carnet de Classe ({observations.length})
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 border-2 ${
                activeTab === 'sheets'
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50/60 shadow-xs'
              }`}
            >
              <CloudUpload className="w-3.5 h-3.5" />
              Google Sheets
              {isSheetsConfigured(sheetsConfig) ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* App Body Content with Staggered Entrance Animations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'accueil' && (
            <div className="space-y-6">
              {/* Context Intro cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-6 space-y-3">
                  <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-5 bg-emerald-400 rounded-full shrink-0"></span>
                    Le projet pédagogique
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Les élèves s'arment de rigueur scientifique pour surveiller les arbres de la ripisylve de l'Huveaune. En liant le collège d'Auriol au dispositif de l'Observatoire des Saisons Provence, ils font progresser la recherche sur le climat en direct !
                  </p>
                  <button 
                    onClick={() => setActiveTab('pedago')}
                    className="text-emerald-700 hover:text-emerald-850 font-black text-xs flex items-center gap-1 pt-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    Découvrir l'activité
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-6 space-y-3">
                  <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-5 bg-emerald-400 rounded-full shrink-0"></span>
                    Les 4 espèces cibles
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Le frêne, le sureau noir, le bouleau verruqueux, le robinier faux-acacia, le noyer commun et le noisetier sont les pièces maîtresses de la berge humide. Chacun de ces végétaux a des stades phénologiques caractéristiques faciles à repérer pour un élève de 6ème.
                  </p>
                  <button 
                    onClick={() => setActiveTab('especes')}
                    className="text-emerald-700 hover:text-emerald-850 font-black text-xs flex items-center gap-1 pt-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    Ouvrir le guide illustré
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-6 space-y-3">
                  <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-5 bg-emerald-400 rounded-full shrink-0"></span>
                    Partage citoyen
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Une fois les données collectées au cours des trois sorties de l'Ubelka (Automne, Hiver, Printemps), l'application permet de compiler et d'exporter un fichier normalisé pour l'Observatoire des Saisons (ODS) afin de nourrir la recherche nationale.
                  </p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="text-emerald-700 hover:text-emerald-850 font-black text-xs flex items-center gap-1 pt-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    Accéder au carnet de classe
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive map representing meanders & College */}
              <HuveauneMap 
                onSelectTree={(treeId) => {
                  setActiveTab('especes'); // switch tab to show species guide when clicked
                }}
              />
            </div>
          )}

          {activeTab === 'pedago' && (
            <PedagogicalGuide />
          )}

          {activeTab === 'especes' && (
            <SpeciesGuide />
          )}

          {activeTab === 'saisie' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-sans font-black text-2xl text-emerald-950 uppercase tracking-tight">
                    Saisie d'observation sur le terrain
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Remplissez cette fiche de saisie numérique en direct sur la tablette de votre groupe d'élèves pendant l'exploration des méandres.
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 text-xs rounded-full uppercase font-black tracking-wider self-start sm:self-center">
                  Sortie active : {activeTripType}
                </span>
              </div>

              <ObservationForm 
                activeTripType={activeTripType}
                onSaveObservation={(newObs) => {
                  handleSaveObservation(newObs);
                  // Auto redirect to carnet/dashboard tab to view saved outputs
                  setTimeout(() => {
                    setActiveTab('dashboard');
                  }, 1200);
                }}
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DataDashboard 
              observations={observations}
              onDeleteObservation={handleDeleteObservation}
              onClearAll={handleClearAll}
              onMarkSubmitted={handleMarkSubmitted}
              sheetsEnabled={isSheetsConfigured(sheetsConfig)}
              isSyncing={isSyncing}
              onSyncOne={handleSyncOne}
              onSyncAll={handleSyncPending}
            />
          )}

          {activeTab === 'sheets' && (
            <SheetSyncPanel
              observations={observations}
              config={sheetsConfig}
              onConfigChange={updateSheetsConfig}
              onTest={handleTestSheets}
              onSyncPending={handleSyncPending}
              onRebuildExport={handleRebuildExport}
              status={syncStatus}
              isSyncing={isSyncing}
            />
          )}
        </motion.div>
      </main>
    </div>
  )}
</>
);
}
