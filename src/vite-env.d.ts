/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL "/exec" du Google Apps Script (pont vers Google Sheets) */
  readonly VITE_ODS_SCRIPT_URL?: string;
  /** Jeton partagé avec le script Apps Script */
  readonly VITE_ODS_SYNC_TOKEN?: string;
  /** Onglet recevant les relevés */
  readonly VITE_ODS_SHEET_NAME?: string;
  /** Onglet régénéré au format ODS */
  readonly VITE_ODS_EXPORT_SHEET?: string;
  /** Nom de la station déclarée à l'ODS */
  readonly VITE_ODS_STATION?: string;
  /** "true" pour activer l'envoi automatique */
  readonly VITE_ODS_AUTO_SYNC?: string;
  /** Lien de consultation du tableur */
  readonly VITE_ODS_SHEET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
