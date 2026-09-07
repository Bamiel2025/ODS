# Liaison Google Sheets — ODS Provence (Collège Ubelka)

Ce document explique comment relier l'application **« Sentinelles de la Ripisylve »** à un
Google Sheets, afin que les relevés saisis par les élèves sur le terrain alimentent
automatiquement un tableau ordonné, prêt à être remonté sur
<https://www.obs-saisons.fr/ods-provence>.

---

## 1. Principe de fonctionnement

```
[Tablette / ordi élève]                [Google Sheets]                  [ODS Provence]
 Fiche de saisie  ──POST JSON──▶  Google Apps Script  ──▶ ODS_Releves   ──▶  obs-saisons.fr
                                  (pont /exec)              │
                                                            └──────────▶ ODS_Export
                                                                    (1 ligne = 1 stade)
```

* L'application envoie chaque fiche (ou un lot de fiches) par une requête `POST` vers un
  **Google Apps Script** déployé en *Application Web*.
* Le script écrit les données dans l'onglet **`ODS_Releves`**, le **trie automatiquement**
  (date → saison → groupe) et **dédoublonne** grâce à l'identifiant unique de chaque fiche.
* Le script régénère ensuite l'onglet **`ODS_Export`** au format de saisie de
  l'Observatoire des Saisons : **une ligne par stade phénologique observé**.
* Aucune clé API Google, aucun OAuth, aucun serveur : seul le lien `/exec` est nécessaire.

---

## 2. Installation (à faire une seule fois)

### 2.1 Créer le tableur et le script

1. Crée un nouveau **Google Sheets**.
2. Menu **Extensions > Apps Script**.
3. Supprime le contenu de l'éditeur et colle le fichier
   [`google-apps-script/Code.gs`](../google-apps-script/Code.gs)
   (ou clique sur **« Copier le code »** dans l'application).
4. En haut du script, vérifie le jeton :

   ```javascript
   var CONFIG = {
     TOKEN: 'ubelka-ods-2027',
     ...
   ```

   Ce jeton doit être **identique** à celui saisi dans l'application.

### 2.2 Déployer en application web

1. **Déployer > Nouveau déploiement**
2. Icône engrenage → **Application Web**
3. Renseigne :
   * **Exécuter en tant que :** `Moi`
   * **Qui a accès :** `Tout le monde`  ← indispensable, les tablettes des élèves ne sont
     pas connectées à ton compte Google. Les données ne sont pas publiques pour autant :
     seules les personnes qui connaissent l'URL `/exec` (et le jeton) peuvent écrire.
4. Clique sur **Déployer**, autorise l'accès, puis **copie l'URL** qui se termine par `/exec`.

### 2.3 Brancher l'application

1. Ouvre l'application, onglet **« Google Sheets »**.
2. Saisis le **code enseignant** (`2027`) pour déverrouiller les réglages.
3. Colle l'URL `/exec`, vérifie le jeton et le nom de la station, puis **Tester**.
4. Active **« Envoi automatique »** : chaque fiche enregistrée part immédiatement
   dans le tableur.

> Après un test réussi, les onglets `ODS_Releves` et `ODS_Export` apparaissent dans le
> tableur (le script les crée automatiquement).

### 2.4 Déploiement partagé (toute la classe) — import Vercel en 1 clic

Un fichier prêt à l'emploi se trouve à la racine du projet : **`.env.vercel`**.

1. Ouvre `.env.vercel` et remplace les deux valeurs marquées *À COMPLÉTER* :
   * `VITE_ODS_SCRIPT_URL` → l'URL `/exec` copiée à l'étape 2.2 ;
   * `VITE_ODS_SHEET_URL` → l'adresse de ton Google Sheet (barre d'adresse du navigateur).
2. Sur Vercel : **Projet > Settings > Environment Variables > Import .env** → choisis le
   fichier → coche *Production, Preview, Development* → **Save**.
3. **Deployments > ⋯ > Redeploy** : les variables d'environnement ne sont prises en compte
   qu'au build, il faut donc relancer un déploiement.

Toutes les tablettes sont alors préconfigurées : plus besoin de saisir le code enseignant
ni l'URL sur chaque appareil. Les réglages saisis dans l'application restent enregistrés
dans le navigateur et sont **prioritaires** sur ces valeurs par défaut.

> Tant que `VITE_ODS_SCRIPT_URL` contient encore le texte `COLLER_ICI_L_URL_EXEC`,
> l'application considère la liaison comme non configurée : aucun risque de fausse
> connexion.

Le fichier `.env.vercel` n'est pas versionné (il contiendra ton jeton et tes URL). Si tu
préfères créer les variables à la main dans Vercel, voici la liste complète :

| Variable                | Valeur                                                |
|-------------------------|-------------------------------------------------------|
| `VITE_ODS_SCRIPT_URL`   | `https://script.google.com/macros/s/AKfycb…/exec`      |
| `VITE_ODS_SYNC_TOKEN`   | `ubelka-ods-2027`                                      |
| `VITE_ODS_SHEET_NAME`   | `ODS_Releves`                                          |
| `VITE_ODS_EXPORT_SHEET` | `ODS_Export`                                           |
| `VITE_ODS_STATION`      | `Collège Ubelka - Auriol (Ripisylve de l'Huveaune)`    |
| `VITE_ODS_SHEET_URL`    | `https://docs.google.com/spreadsheets/d/…/edit`         |
| `VITE_ODS_AUTO_SYNC`    | `true`                                                 |

---

## 3. Les deux onglets produits

### `ODS_Releves` (tableau brut et ordonné)

28 colonnes, triées par date, saison puis groupe :

`ID_OBSERVATION`, `DATE`, `SAISON`, `TYPE_FICHE`, `GROUPE`, `ESPECE`, `NOM_LATIN`,
`STATION`, `ZONE`, `FEUILLAISON_DEBUT`, `FEUILLAISON_PLEIN`, `FLORAISON_DEBUT`,
`FLORAISON_PLEIN`, `FRUCTIFICATION_DEBUT`, `FRUCTIFICATION_PLEIN`, `SENESCENCE_DEBUT`,
`SENESCENCE_PLEIN`, `PREMIER_EVENEMENT`, `EFFECTIF`, `COMPLEMENT`, `METEO`,
`TEMPERATURE`, `NIVEAU_HUVEAUNE`, `CONFIANCE`, `REMARQUES`, `PHOTOS`, `ENVOYE_LE`,
`SOURCE`

### `ODS_Export` (format de saisie obs-saisons.fr)

`DATE`, `STATION`, `GROUPE`, `TYPE_FICHE`, `ESPECE`, `STADE_CODE`, `STADE_LIBELLE`,
`EFFECTIF`, `REMARQUES`, `ID_RELEVE`

| Stade relevé dans l'application     | Code ODS | Libellé                          |
|-------------------------------------|----------|----------------------------------|
| Feuillaison – début (~10 %)         | `F1`     | Débourrement (F1)                |
| Feuillaison – plein (~50 %)         | `F2`     | Feuilles étalées (F2)            |
| Floraison – début                   | `Fl1`    | Début floraison (Fl1)            |
| Floraison – plein                   | `Fl2`    | Pleine floraison (Fl2)           |
| Fructification – début              | `Fr1`    | Apparition des fruits (Fr1)      |
| Fructification – plein              | `Fr2`    | Maturité des fruits (Fr2)        |
| Sénescence – début                  | `F3`     | Changement de couleur (F3)       |
| Sénescence – plein                  | `F4`     | Chute des feuilles (F4)          |
| 1re fleur épanouie (herbacée)       | `Fl1`    | Première fleur épanouie (Fl1)    |
| 1re observation adulte (animale)    | `A1`     | Première observation adulte (A1) |

> Les codes `F1 → F4`, `Fl1 → Fl3`, `Fr1 → Fr3` sont ceux du protocole ODS.

---

## 4. Remonter les données sur obs-saisons.fr

1. Ouvre le tableur, onglet **`ODS_Export`**.
2. Connecte-toi à ton compte sur <https://www.obs-saisons.fr> (espace de saisie ODS Provence).
3. Reporte les lignes par date/stade pour ta station
   **« Collège Ubelka – Auriol (Ripisylve de l'Huveaune) »**.
4. En cas de besoin, tu peux aussi transmettre le CSV généré depuis l'application
   (bouton *Télécharger le CSV format ODS*) à l'équipe ODS Provence :
   <odsprovence@imbe.fr>.

---

## 5. Sécurité et bonnes pratiques

* **Jeton** : change `CONFIG.TOKEN` dans le script et dans l'application avant de partager
  le lien à l'extérieur de l'établissement.
* **Doublons** : impossibles — chaque fiche possède un `ID_OBSERVATION` unique ; un second
  envoi de la même fiche est ignoré (ou met la ligne à jour si l'option est activée).
* **Hors-ligne** : les fiches restent enregistrées dans le navigateur ; le bouton
  *Envoyer* du carnet de classe les transmet dès que la connexion revient.
* **RGPD / données élèves** : seules des données d'observation sont transmises, aucun nom
  d'élève (uniquement le nom du groupe : « Groupe Castor », etc.).

---

## 6. Dépannage

| Symptôme                                              | Cause probable / solution                                                                 |
|-------------------------------------------------------|-------------------------------------------------------------------------------------------|
| « Connexion refusée » ou jeton invalide               | Le jeton de l'application diffère de `CONFIG.TOKEN` du script.                              |
| « Envoi impossible »                                  | Pas de connexion Internet, ou URL `/exec` erronée.                                          |
| Le test fonctionne mais rien n'apparaît dans le tableur | Vérifie que le déploiement est bien **Application Web / Tout le monde** et que tu as déployé la **dernière** version (Déployer > Gérer les déploiements > Modifier). |
| Onglet `ODS_Export` vide                              | Aucun stade coché dans les fiches, ou clic sur *Reconstruire l'onglet ODS_Export*.           |
| Erreur d'autorisation Google au premier déploiement   | Cliquer sur *Avancé > Autoriser* lors de l'écran « Google n'a pas vérifié cette application ».|
| Doublons malgré tout                                  | Impossible : vérifie que deux navigateurs n'ont pas créé la même fiche avant synchronisation (l'ID est horodaté). |
| **« Fonction de script introuvable : doGet »** (page Google) | Le déploiement en ligne est **antérieur** au collage de `Code.gs`. Apps Script publie un instantané : il faut *Déployer > Gérer les déploiements > (crayon) > Version : Nouvelle version > Déployer*. L'URL `/exec` reste alors la même. |
| « Réponse illisible du Google Sheet »                 | Le script n'est pas déployé en *Application Web*, ou l'accès n'est pas *Tout le monde*. |

Le script ajoute également un menu **« ODS Provence »** dans le tableur pour reconstruire
l'export ou vérifier la connexion à la main.
