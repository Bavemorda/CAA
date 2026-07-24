# Traducteur de phrases en pictogrammes

Traduit une phrase tapée en français en une bande de pictogrammes, avec choix
de la banque de pictogrammes et plusieurs propositions par mot. Tout tourne
dans le navigateur : aucune installation, aucun serveur.

Le projet est décrit en détail dans [`CLAUDE.md`](./CLAUDE.md) (cahier de
route : objectifs, architecture, décisions, plan par étapes).

## État actuel : étape 1 (socle / MVP)

- Saisie de texte → lemmatisation → recherche dans un index local → bande de
  pictogrammes avec plusieurs propositions par mot, sélectionnables.
- Deux banques : **ARASAAC** (~13 800 pictogrammes, index complet) et
  **Mulberry** (vocabulaire de base, ~95 mots, v1).
- Les petits mots (articles, prépositions...) sont écartés par défaut ; case
  « Mot-à-mot » pour les garder.

Pas encore fait : banque personnelle, export PDF/PNG, OCR photo, mode hors
ligne — voir le plan par étapes dans `CLAUDE.md` (§10).

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
node scripts/build-index-mulberry.mjs  # -> data/index-mulberry.json (vocabulaire dans mulberry-fr-vocab.mjs)
node scripts/build-lemmes.mjs          # -> data/fr-lemmes.json
```

## Limites connues de la v1

- **Lemmatisation** : dictionnaire construit par règles de conjugaison +
  table de verbes/mots irréguliers courants (voir `scripts/build-lemmes.mjs`),
  pas un lexique complet type Lexique/Lefff. Un mot rare ou une forme rare
  peut ne pas être ramené à son lemme ; il est alors cherché tel quel.
- **Mulberry** : Mulberry n'a pas de traduction française officielle et son
  vocabulaire est orienté objets concrets (pas de mot comme « bonjour » ou
  « merci » dans ce jeu) ; la couverture v1 est donc volontairement plus
  réduite qu'ARASAAC. Voir `scripts/mulberry-fr-vocab.mjs` pour l'étendre.
- Licences : ARASAAC est **CC BY-NC-SA** (non commercial), Mulberry est
  **CC BY-SA**. Attribution affichée dans l'appli.

## Architecture en bref

Chaque banque de pictogrammes implémente la même interface (`chercher(mot)`,
voir `src/sources/source.js`) ; le moteur de traduction (`src/translate.js`)
ne connaît que cette interface. Ajouter une banque = ajouter un fichier dans
`src/sources/` + l'enregistrer dans `src/main.js`. Détails complets dans
`CLAUDE.md`.
