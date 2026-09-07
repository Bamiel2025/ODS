<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Sentinelles de la Ripisylve — ODS Provence (Collège Ubelka, Auriol)

Application pédagogique de saisie de relevés phénologiques pour le niveau 6ème, reliée au
dispositif [Observatoire des Saisons Provence](https://www.obs-saisons.fr/ods-provence).

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optionnel) Configure la liaison Google Sheets en copiant `.env.example` vers `.env.local`
4. Run the app:
   `npm run dev`

## Liaison Google Sheets

Les fiches de saisie remplies par les élèves peuvent être envoyées **automatiquement** dans
un Google Sheet, sous forme d'un tableau ordonné, puis remontées sur `obs-saisons.fr`.

Fonctionnement : l'application `POST` les relevés vers un Google Apps Script déployé en
application web, qui alimente deux onglets :

| Onglet        | Contenu                                                                    |
|---------------|----------------------------------------------------------------------------|
| `ODS_Releves` | Toutes les fiches (28 colonnes), triées par date, saison puis groupe        |
| `ODS_Export`  | Une ligne par stade phénologique observé, au format de saisie obs-saisons.fr |

Points clés :

* aucune clé API / OAuth : seul le lien `/exec` du script est nécessaire ;
* dédoublonnage automatique par `ID_OBSERVATION` (pas de doublons en cas de double envoi) ;
* envoi automatique ou manuel, file d'attente conservée dans le navigateur si hors-ligne ;
* réglages protégés par le code enseignant `2027` ;
* codes de stades conformes au protocole ODS : l'export utilise l'**échelle BBCH** (`CODE_BBCH` = `11 / 15 / 61 / 65 / 85 / 91 / 95`) ; `STADE_INTERNE` conserve les codes maison (`F1, F2, Fl1, Fl2, Fr1, Fr2, F3, F4, A1`) pour le suivi en classe.

**Procédure complète :** [`docs/GOOGLE-SHEETS-ODS.md`](./docs/GOOGLE-SHEETS-ODS.md)
**Script à coller dans le tableur :** [`google-apps-script/Code.gs`](./google-apps-script/Code.gs)

Fichiers concernés :

```
src/lib/odsSheets.ts            # service de synchronisation (mapping, envoi, test)
src/components/SheetSyncPanel.tsx  # panneau de configuration (onglet "Google Sheets")
google-apps-script/Code.gs      # pont côté Google Sheets
docs/GOOGLE-SHEETS-ODS.md       # mode d'emploi
```
