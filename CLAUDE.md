# Traducteur de phrases en pictogrammes — cahier de route

> Document de passation et source de vérité du projet.
> À lire en premier, et à déposer à la racine du dépôt (voir « Reprise du projet »).

---

## 1. En une phrase

Un outil qui transforme **du texte — tapé ou lu depuis une photo — en une bande de pictogrammes**, comme `free.pictofacile.com`, mais avec le **choix de la banque de pictogrammes** (dont une banque personnelle) et une **saisie par photo** (OCR). Tout fonctionne **dans le navigateur de l'utilisateur, sans aucune installation**.

## 2. Ce que fait l'outil (et ce qu'il ne fait pas)

Dans le périmètre :
- Saisie d'une phrase (tapée) → bande de pictogrammes.
- Saisie par **photo** → lecture du texte (OCR) → correction possible → bande.
- **Choix de la banque** de pictogrammes (plusieurs styles) et **chargement d'une banque personnelle**.
- Pour chaque mot, **plusieurs pictogrammes proposés** ; l'utilisateur choisit.
- **Export** de la bande (PDF et image).

Hors périmètre (pour l'instant) :
- La reconnaissance de l'**écriture manuscrite** (l'OCR ne gère bien que le texte imprimé).
- Le multi-langue (on commence en **français**).
- Le fonctionnement **100 % hors ligne** dès la v1 (voir étape 4).

## 3. Principe directeur

La traduction est un enchaînement **déterministe**, sans IA générative :

**(photo → OCR) → texte → découpage → lemmatisation → filtrage des petits mots → recherche dans la banque → bande (avec choix par mot).**

- **Lemmatisation** = ramener chaque mot à sa forme de base (« est » → « être », « chevaux » → « cheval »). Assurée par un **dictionnaire embarqué** des formes fléchies du français, pas par un modèle.
- **Ambiguïté** (« souris » animal ou objet) : on ne « devine » pas, on **affiche les candidats et l'utilisateur tranche**. C'est le standard du domaine (AraWord, Pictofacile).

## 4. Architecture

### 4.1 La décision structurante : la « source » interchangeable
Toutes les banques sont vues à travers **une même prise** : une fonction unique du type `chercher(mot) → [ { image, étiquette, source } ]`. Chaque banque (ARASAAC, Mulberry, banque personnelle…) implémente cette prise. **Le moteur de traduction ne sait pas quelle banque il interroge.** Changer ou ajouter une banque = brancher une nouvelle source, rien d'autre.

### 4.2 Les briques
- **OCR** : `Tesseract.js` (moteur OCR libre porté dans le navigateur via WebAssembly), données françaises `fra`. Texte imprimé uniquement en v1. Le texte reconnu s'affiche dans une **zone modifiable** (l'OCR se trompe parfois).
- **Lemmatisation** : table `forme fléchie → lemme` (dérivée d'un lexique libre type Lexique/Lefff), chargée comme simple fichier de données.
- **Recherche** : **index local `mot-clé → identifiant`** pour chaque banque, construit une fois d'avance. On évite ainsi toute dépendance réseau à l'exécution (c'est la leçon des essais précédents où l'appli ne pouvait pas joindre le serveur des banques).
- **Images** : chargées depuis les URL d'images de chaque banque (ou embarquées pour la banque perso).
- **Export** : PDF (par ex. `jsPDF`) et PNG.

### 4.3 Hébergement
Site **statique** publié sur **GitHub Pages** : l'utilisateur ouvre un **lien**, tout se calcule chez lui, le partage = partager le lien.

## 5. Décisions déjà prises

| Sujet | Décision |
|---|---|
| Où ça tourne | Appli **côté navigateur**, hébergée en statique (GitHub Pages). Aucune installation pour l'utilisateur. |
| Langue | **Français** d'abord. |
| Traduction | Déterministe, **sans LLM**. |
| Lemmatisation | Dictionnaire français embarqué. |
| OCR | `Tesseract.js`, imprimé seulement en v1. |
| Multi-banques | Via l'abstraction « source ». |
| Recherche | **Index local** par banque (pas d'appel réseau à l'exécution). |
| Ambiguïté | Propositions multiples, choix par l'utilisateur. |
| Petits mots | Articles écartés par défaut (style télégraphique), avec option « mot-à-mot ». |
| Licences | Attribution obligatoire ; ARASAAC/Sclera = **usage non commercial**. |

## 6. Points à confirmer (avec ma recommandation)

1. **Français seul en v1 ?** → recommandé oui ; le multi-langue viendra ensuite.
2. **Quelle 2ᵉ banque livrer en premier**, à côté d'ARASAAC ? → recommandé **Mulberry** (licence CC BY-SA plus permissive, style dessiné, contraste avec ARASAAC). Sclera (noir et blanc contrasté) est une bonne 3ᵉ.
3. **Index local (recommandé) vs API en direct** ? → recommandé index local ; cela ajoute un petit **script de construction** à lancer une fois.
4. **Export PDF dès le MVP** ou plus tard ? → recommandé : affichage d'abord, PDF juste après.
5. **Coloration par catégorie grammaticale** (code Fitzgerald) souhaitée à terme ? → optionnelle, phase ultérieure.

## 7. Les banques de pictogrammes (diversité)

Deux agrégateurs donnent accès à plusieurs jeux d'un coup : **OpenSymbols** (opensymbols.org, API ouverte documentée) et **Global Symbols** (globalsymbols.com). Jeux et licences principaux :

- **ARASAAC** — couleur, ~13 000, CC BY-NC-SA (non commercial).
- **Sclera** — noir et blanc contrasté, ~11 000, CC BY-NC.
- **Mulberry** — dessins couleur, ~3 000, **CC BY-SA** (plus permissive).
- **OpenMoji / Tawasol / emojis** — CC BY-SA / CC BY.

> Conséquence licence : pour un usage **non commercial** (soins, école, familles), tout convient. Pour un usage plus large un jour, privilégier Mulberry/OpenMoji (BY-SA).

## 8. Format de la banque personnelle

Un **dossier d'images** + un **manifeste** (fichier `manifest.csv`), que l'utilisateur dépose dans l'appli. Schéma du manifeste :

| Colonne | Obligatoire | Rôle |
|---|---|---|
| `fichier` | oui | nom du fichier image (ex. `chat.png`) |
| `mots` | oui | un ou plusieurs mots-clés, séparés par `;` (ex. `chat;minou`) |
| `lemme` | non | forme de base si différente (ex. `chat`) |
| `categorie` | non | nature grammaticale (nom, verbe…) pour une future coloration |
| `synonymes` | non | mots supplémentaires menant à cette image |

La banque perso devient alors **une source comme les autres**.

## 9. Structure du dépôt (proposée)

```
index.html
/src
  main.js
  ocr.js            (enrobage Tesseract.js)
  lemmatizer.js     (charge la table fr, fonction normaliser())
  translate.js      (pipeline complet)
  render.js         (bande + choix des alternatives)
  export.js         (PDF / PNG)
  sources/
    source.js       (l'interface commune)
    arasaac.js
    mulberry.js
    custom.js        (dossier + manifeste)
/data
  fr-lemmes.json     (forme → lemme)
  stopwords-fr.json  (petits mots à écarter)
  index-arasaac.json (mot-clé → identifiant)
  index-mulberry.json
/scripts
  build-index.mjs    (construit une fois les index mot-clé → identifiant)
CLAUDE.md            (renvoie à ce cahier de route)
README.md
```

Pile technique : **HTML/CSS/JavaScript simple** (peu de dépendances), `Tesseract.js` et `jsPDF` chargés depuis un CDN. Pas de serveur.

## 10. Plan par étapes (chaque étape est utilisable seule)

1. **Socle (MVP)** — saisie de texte tapé → lemmatisation → recherche via index local → bande avec choix par mot, pour **ARASAAC + Mulberry**. (≈ Pictofacile avec choix de banque.)
2. **Banque personnelle** — chargement dossier + manifeste comme source supplémentaire.
3. **Export** — PDF et PNG.
4. **OCR** — photo → Tesseract.js → texte reconnu (corrigeable) → traduction.
5. **Hors ligne (PWA)** — mise en cache pour fonctionner sans connexion après le 1ᵉʳ chargement.

## 11. Limites à assumer, franchement

- 1ᵉʳ chargement : nécessite Internet (télécharger le moteur OCR et les données).
- OCR : bon sur l'imprimé, faible sur le manuscrit.
- Sans modèle : les cas tordus (idiomes, ambiguïté fine) se règlent par le **choix manuel** parmi les propositions, pas par du « raisonnement ».
- Licences non commerciales sur ARASAAC/Sclera.
- L'outil étant destiné à la CAA, garder l'interface **accessible** (navigation clavier, cibles larges, bon contraste).

---

## 12. Reprise du projet (prise en main)

Deux façons de continuer. Le **résultat final est identique** dans les deux cas ; le choix ne concerne que le confort de fabrication.

### Option A — Claude Code (recommandé pour construire)
Claude Code est l'outil d'Anthropic qui travaille **directement dans les fichiers du projet** (au lieu de renvoyer des fichiers un par un dans le chat). Pour une prise en main douce, préférer l'**application de bureau Claude Code** (plus simple que le terminal).

À savoir, sans surprise :
- Il faut un **abonnement payant** (Claude Pro, Max, Team/Enterprise ou un compte API). Le plan gratuit n'y donne pas accès.
- Installation : télécharger l'app depuis `claude.com/download`, se connecter, ouvrir l'onglet **Code**. (Le terminal reste possible via l'installeur natif décrit sur `code.claude.com/docs/en/setup`, sans Node.js requis.)

Premiers pas :
1. Créer un dépôt GitHub (vide) et l'ouvrir dans Claude Code.
2. Y déposer ce fichier, renommé `CLAUDE.md` (Claude Code le lit automatiquement à chaque session).
3. Coller ce **message de démarrage** :

> « Lis `CLAUDE.md`, notre cahier de route. Construis l'**étape 1 (socle/MVP)** : une page web statique, tout côté navigateur, où l'on tape une phrase en français, où l'on choisit une banque de pictogrammes, et où une bande s'affiche avec plusieurs propositions par mot que l'on peut sélectionner. Respecte l'architecture "source" et commence par ARASAAC et Mulberry via des **index de mots-clés locaux**. Explique-moi simplement chaque étape, et propose-moi de tester avant d'aller plus loin. »

4. Quand le socle marche, avancer étape par étape (§10) : « Passe à l'étape 2 », etc.
5. Publier sur **GitHub Pages** (Claude Code peut préparer la configuration) pour obtenir le lien à partager.

### Option B — Continuer dans le chat Claude
Si le passage à Claude Code semble trop technique au début, on peut poursuivre **ici, dans la conversation** : je produis les fichiers, vous les assemblez. C'est plus manuel pour un projet multi-fichiers, mais parfaitement viable pour démarrer.

---

## 13. Glossaire express

- **OCR** : lecture automatique du texte contenu dans une image.
- **Lemmatisation** : ramener un mot à sa forme de base (« mange » → « manger »).
- **Index** : table de correspondance préparée à l'avance (ici, mot-clé → pictogramme).
- **Source** : la « prise » commune par laquelle chaque banque est interrogée de la même façon.
- **Site statique / GitHub Pages** : des fichiers mis en ligne tels quels, sans serveur ; ouverts via un simple lien.
- **PWA** : page web qui se met en cache pour fonctionner hors ligne.
- **Claude Code / `CLAUDE.md`** : outil qui code dans les fichiers du projet ; `CLAUDE.md` est le fichier de contexte qu'il lit à chaque session.
