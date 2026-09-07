import React, { useState, useEffect } from 'react';
import {
  CloudUpload,
  Link2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  Copy,
  ClipboardPaste,
  Settings2,
  Wifi,
  Database
} from 'lucide-react';

import { Observation } from '../types';
import {
  OdsSheetsConfig,
  isSheetsConfigured,
  buildExportCsv
} from '../lib/odsSheets';

// Code enseignant protégeant la configuration (identique au reste des applications)
const TEACHER_CODE = '2027';

// Code source du pont Google Apps Script, embarqué pour être copié en un clic.
import appsScriptSource from '../../google-apps-script/Code.gs?raw';

export type SyncStatusKind = 'idle' | 'ok' | 'error' | 'running';

export interface SyncStatus {
  kind: SyncStatusKind;
  message: string;
  at?: string;
}

interface SheetSyncPanelProps {
  observations: Observation[];
  config: OdsSheetsConfig;
  onConfigChange: (config: OdsSheetsConfig) => void;
  onTest: () => void;
  onSyncPending: () => void;
  onRebuildExport: () => void;
  status: SyncStatus;
  isSyncing: boolean;
  isMobile?: boolean;
}

export default function SheetSyncPanel({
  observations,
  config,
  onConfigChange,
  onTest,
  onSyncPending,
  onRebuildExport,
  status,
  isSyncing,
  isMobile = false
}: SheetSyncPanelProps) {
  const [draft, setDraft] = useState<OdsSheetsConfig>(config);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [codeError, setCodeError] = useState<boolean>(false);
  const [copied, setCopied] = useState<string>('');

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const configured = isSheetsConfigured(draft);
  const pending = observations.filter(o => !o.syncedAt);
  const synced = observations.filter(o => o.syncedAt);

  const updateDraft = (patch: Partial<OdsSheetsConfig>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onConfigChange(next);
  };

  const handleUnlock = () => {
    if (codeInput.trim() === TEACHER_CODE) {
      setUnlocked(true);
      setCodeError(false);
      setCodeInput('');
    } else {
      setCodeError(true);
    }
  };

  const copyToClipboard = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2500);
    } catch {
      setCopied('impossible');
      setTimeout(() => setCopied(''), 2500);
    }
  };

  const downloadExportCsv = () => {
    const csv = buildExportCsv(observations, draft);
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ods_export_ubelka_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ------------------------------------------------------------------ */
  /*  Écran de déverrouillage                                            */
  /* ------------------------------------------------------------------ */
  if (!unlocked) {
    return (
      <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800">
            Réglages enseignant — Liaison Google Sheets
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-sans leading-relaxed mb-4">
          La configuration du lien vers le tableur est réservée à l'enseignant. Saisis le code
          professeur pour ouvrir les réglages.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="password"
            inputMode="numeric"
            value={codeInput}
            onChange={e => {
              setCodeInput(e.target.value);
              setCodeError(false);
            }}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="Code enseignant"
            className="flex-1 border-2 border-emerald-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-400"
          />
          <button
            onClick={handleUnlock}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-2xl border-2 border-emerald-700 shadow-md cursor-pointer"
          >
            Déverrouiller
          </button>
        </div>
        {codeError && (
          <p className="text-rose-600 text-[11px] font-black uppercase mt-2">
            Code incorrect — réessaie.
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Panneau de configuration                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div className="space-y-6">
      {/* État de la connexion */}
      <div
        className={`rounded-3xl border-2 shadow-sm p-5 sm:p-6 ${
          configured
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 ${
                configured
                  ? 'bg-white border-emerald-300 text-emerald-700'
                  : 'bg-white border-amber-300 text-amber-700'
              }`}
            >
              {configured ? <Wifi className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-900">
                {configured ? 'Tableur connecté' : 'Liaison non configurée'}
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                {configured
                  ? 'Les fiches saisies par les élèves peuvent être envoyées dans ton Google Sheet.'
                  : "Colle l'URL /exec de ton Google Apps Script pour activer l'envoi automatique."}
              </p>
            </div>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} gap-2 shrink-0`}>
            <div className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-center">
              <div className="font-black text-emerald-950 text-sm font-mono">{observations.length}</div>
              <div className="text-[8.5px] uppercase font-black text-emerald-700">Fiches</div>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl px-3 py-2 text-center">
              <div className="font-black text-amber-800 text-sm font-mono">{pending.length}</div>
              <div className="text-[8.5px] uppercase font-black text-amber-700">À envoyer</div>
            </div>
            <div className="bg-white border border-sky-200 rounded-xl px-3 py-2 text-center">
              <div className="font-black text-sky-800 text-sm font-mono">{synced.length}</div>
              <div className="text-[8.5px] uppercase font-black text-sky-700">Envoyées</div>
            </div>
          </div>
        </div>

        {/* Message de statut */}
        {status.message && (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 flex items-start gap-2 border ${
              status.kind === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : status.kind === 'ok'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                : 'bg-white border-emerald-200 text-slate-600'
            }`}
          >
            {status.kind === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : status.kind === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className={`w-4 h-4 shrink-0 mt-0.5 ${isSyncing ? 'animate-spin' : ''}`} />
            )}
            <p className="text-[11px] font-bold leading-relaxed">{status.message}</p>
          </div>
        )}

        {/* Actions principales */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onSyncPending}
            disabled={!configured || isSyncing || pending.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl border-2 border-emerald-700 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <CloudUpload className="w-4 h-4" />
            Envoyer {pending.length > 0 ? `(${pending.length})` : ''}
          </button>
          <button
            onClick={onTest}
            disabled={!configured || isSyncing}
            className="bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl flex items-center gap-1.5 cursor-pointer"
          >
            <Wifi className="w-4 h-4 text-emerald-600" />
            Tester
          </button>
          <button
            onClick={onRebuildExport}
            disabled={!configured || isSyncing}
            className="bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            Reconstruire l'export ODS
          </button>
          {draft.sheetUrl && (
            <a
              href={draft.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-emerald-50 border-2 border-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              Ouvrir le tableur
            </a>
          )}
        </div>
      </div>

      {/* Réglages */}
      <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4 border-b-2 border-emerald-50 pb-3">
          <Settings2 className="w-4 h-4 text-emerald-600" />
          <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800">
            Paramètres du pont Google Sheets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="md:col-span-2 block">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
              URL du Google Apps Script (/exec)
            </span>
            <div className="flex items-center gap-2 border-2 border-emerald-100 rounded-2xl px-3 py-2 focus-within:border-emerald-400">
              <Link2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <input
                type="url"
                value={draft.scriptUrl}
                onChange={e => updateDraft({ scriptUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full text-xs font-semibold text-emerald-950 outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
              Jeton de sécurité
            </span>
            <input
              type="text"
              value={draft.token}
              onChange={e => updateDraft({ token: e.target.value })}
              className="w-full border-2 border-emerald-100 rounded-2xl px-3 py-2 text-xs font-semibold text-emerald-950 outline-none focus:border-emerald-400"
            />
            <span className="text-[9px] text-slate-400 font-bold block mt-1">
              Doit être identique à CONFIG.TOKEN dans le script.
            </span>
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
              Nom de la station ODS
            </span>
            <input
              type="text"
              value={draft.station}
              onChange={e => updateDraft({ station: e.target.value })}
              className="w-full border-2 border-emerald-100 rounded-2xl px-3 py-2 text-xs font-semibold text-emerald-950 outline-none focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
              Onglet des relevés
            </span>
            <input
              type="text"
              value={draft.sheetName}
              onChange={e => updateDraft({ sheetName: e.target.value })}
              className="w-full border-2 border-emerald-100 rounded-2xl px-3 py-2 text-xs font-semibold text-emerald-950 outline-none focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
              Onglet d'export ODS
            </span>
            <input
              type="text"
              value={draft.exportSheetName}
              onChange={e => updateDraft({ exportSheetName: e.target.value })}
              className="w-full border-2 border-emerald-100 rounded-2xl px-3 py-2 text-xs font-semibold text-emerald-950 outline-none focus:border-emerald-400"
            />
          </label>

          <label className="md:col-span-2 block">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
              Lien de consultation du tableur (facultatif)
            </span>
            <input
              type="url"
              value={draft.sheetUrl}
              onChange={e => updateDraft({ sheetUrl: e.target.value })}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full border-2 border-emerald-100 rounded-2xl px-3 py-2 text-xs font-semibold text-emerald-950 outline-none focus:border-emerald-400"
            />
          </label>

          <label className="md:col-span-2 flex items-center gap-3 bg-emerald-50 border-2 border-emerald-100 rounded-2xl px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.autoSync}
              onChange={e => updateDraft({ autoSync: e.target.checked })}
              className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
            <span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                Envoi automatique
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Chaque fiche enregistrée par un groupe est transmise immédiatement au Google Sheet
                (si la connexion est disponible).
              </span>
            </span>
          </label>
        </div>

        <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mt-4">
          Les réglages sont enregistrés dans ce navigateur. Pour les partager à toute la classe,
          renseigne-les aussi dans le fichier .env (VITE_ODS_SCRIPT_URL…).
        </p>
      </div>

      {/* Export de secours */}
      <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800">
            Export de secours (sans connexion)
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-3">
          Génère un CSV identique à l'onglet « ODS_Export » : une ligne par stade phénologique
          observé, prêt à être importé ou recopié sur{' '}
          <a
            href="https://www.obs-saisons.fr/ods-provence"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-black underline"
          >
            obs-saisons.fr
          </a>
          .
        </p>
        <button
          onClick={downloadExportCsv}
          disabled={observations.length === 0}
          className="bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-2xl flex items-center gap-1.5 cursor-pointer"
        >
          <Database className="w-4 h-4 text-emerald-600" />
          Télécharger le CSV format ODS
        </button>
      </div>

      {/* Mode d'emploi */}
      <details className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-5 sm:p-6 group">
        <summary className="cursor-pointer flex items-center gap-2 list-none">
          <ClipboardPaste className="w-4 h-4 text-emerald-600" />
          <span className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800">
            Installer le pont en 5 étapes (mode d'emploi)
          </span>
        </summary>

        <ol className="mt-4 space-y-2.5 text-[11px] text-slate-600 font-sans leading-relaxed list-decimal list-inside">
          <li>Crée un nouveau Google Sheets, puis ouvre <strong>Extensions &gt; Apps Script</strong>.</li>
          <li>
            Efface le contenu de l'éditeur et colle le code ci-dessous (bouton « Copier le code »).
          </li>
          <li>
            Dans le script, vérifie que <code className="bg-slate-100 px-1 rounded">CONFIG.TOKEN</code>{' '}
            correspond au jeton saisi plus haut.
          </li>
          <li>
            <strong>Déployer &gt; Nouveau déploiement &gt; Application Web</strong> : exécuter en tant
            que « Moi », accès « Tout le monde ». Copie l'URL <code className="bg-slate-100 px-1 rounded">/exec</code>.
          </li>
          <li>Colle cette URL dans le champ ci-dessus, puis clique sur <strong>Tester</strong>.</li>
        </ol>

        <div className="mt-4 bg-slate-900 rounded-2xl p-4 text-emerald-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
              google-apps-script/Code.gs
            </span>
            <button
              onClick={() => copyToClipboard('script', appsScriptSource)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copied === 'script' ? 'Copié !' : 'Copier le code'}
            </button>
          </div>
          <pre className="max-h-52 overflow-auto text-[9.5px] leading-relaxed font-mono whitespace-pre">
            {appsScriptSource.slice(0, 1400)}
            {'\n…\n'}
          </pre>
        </div>

        <p className="text-[10px] text-slate-500 font-semibold mt-3">
          Le script crée automatiquement les onglets « {draft.sheetName} » (tableau trié par date et
          par groupe) et « {draft.exportSheetName} » (format de saisie obs-saisons.fr). Chaque fiche
          possède un identifiant unique : un double envoi ne crée jamais de doublon.
        </p>
      </details>
    </div>
  );
}
