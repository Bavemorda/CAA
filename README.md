# Traducteur de phrases en pictogrammes

Traduit une phrase tapée en français en une bande de pictogrammes, avec choix
de la banque de pictogrammes et plusieurs propositions par mot. Tout tourne
dans le navigateur : aucune installation, aucun serveur.

Le projet est décrit en détail dans [`CLAUDE.md`](./CLAUDE.md) (cahier de
route : objectifs, architecture, décisions, plan par étapes).

## État actuel : étapes 1, 3 (PDF) et 4 (OCR)

- Saisie de texte → lemmatisation → recherche dans un index local → bande de
  pictogrammes avec plusieurs propositions par mot, sélectionnables.
- Une banque : **ARASAAC** (~13 800 pictogrammes, index complet). Mulberry a
  été retiré (vocabulaire trop limité en v1) ; l'architecture « source »
  permet d'en rebrancher une plus tard sans toucher au moteur de traduction.
- Les petits mots (articles, prépositions...) sont écartés par défaut ; case
  « Mot-à-mot » pour les garder.
- **Photo → texte (OCR)** : `Tesseract.js`, texte imprimé en français, dans
  une zone modifiable avant traduction (`src/ocr.js`).
- **Export PDF** (`src/export.js`, via `jsPDF`) : la photo d'origine (si une
  photo a été utilisée) en haut de page, la bande de pictogrammes en dessous.

Pas encore fait : banque personnelle, export PNG, mode hors ligne — voir le
plan par étapes dans `CLAUDE.md` (§10).

## Utiliser le projet en local

Aucune installation n'est nécessaire pour l'utiliser : c'est du HTML/CSS/JS
simple. Il faut juste le servir en HTTP (pas en `file://`, sinon les fichiers
`data/*.json` ne se chargent pas) :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/
```

## Régénérer les données (`/scripts`)

Ces scripts Node (aucune dépendance à installer, `fetch` natif) reconstruisent
les fichiers de `/data`. À relancer seulement si l'on veut rafraîchir les
banques ou étendre le vocabulaire.

```bash
node scripts/build-index-arasaac.mjs   # -> data/index-arasaac.json
node scripts/build-lemmes.mjs          # -> data/fr-lemmes.json
```

## Limites connues de la v1

- **Lemmatisation** : dictionnaire construit par règles de conjugaison +
  table de verbes/mots irréguliers courants (voir `scripts/build-lemmes.mjs`),
  pas un lexique complet type Lexique/Lefff. Un mot rare ou une forme rare
  peut ne pas être ramené à son lemme ; il est alors cherché tel quel.
- Licence : ARASAAC est **CC BY-NC-SA** (non commercial). Attribution
  affichée dans l'appli.
- **Homographes** : quand un mot a plusieurs sens (« est » = verbe être ou
  point cardinal), la lemmatisation est essayée en priorité — « est » cherche
  donc d'abord « être ». Ordre des candidats dans `src/lemmatizer.js`
  (`lemmatiser()`).
- **OCR** : texte imprimé uniquement (pas l'écriture manuscrite). Le premier
  essai télécharge le moteur Tesseract.js et les données françaises
  (quelques Mo) ; les essais suivants sont plus rapides. L'orientation EXIF
  de la photo n'est pas corrigée automatiquement.
- **Export PDF** : les pictogrammes affichés sont redessinés (rastérisés)
  localement avant d'être insérés dans le PDF, ce qui suppose que le serveur
  d'images de la banque autorise cet usage (CORS) — c'est le cas d'ARASAAC.

## Architecture en bref

Chaque banque de pictogrammes implémente la même interface (`chercher(mot)`,
voir `src/sources/source.js`) ; le moteur de traduction (`src/translate.js`)
ne connaît que cette interface. Ajouter une banque = ajouter un fichier dans
`src/sources/` + l'enregistrer dans `src/main.js`. Détails complets dans
`CLAUDE.md`.
