// L'interface commune à toutes les banques de pictogrammes ("la prise").
//
// Une source est un objet :
//   {
//     id: "arasaac",              identifiant technique unique
//     nom: "ARASAAC",             nom affiché
//     licence: "CC BY-NC-SA",     mention de licence à afficher (attribution)
//     chercher(motNormalise): [{ image, etiquette, source }]
//   }
//
// Le moteur de traduction (translate.js) n'appelle jamais rien d'autre que
// chercher(mot). Ajouter une banque = écrire un nouveau fichier qui respecte
// cette forme et l'enregistrer dans SOURCES_DISPONIBLES (voir main.js).

/**
 * @typedef {Object} Pictogramme
 * @property {string} image      URL (ou data URI) de l'image
 * @property {string} etiquette  mot-clé affiché sous l'image
 * @property {string} source     id de la source d'origine
 */

/**
 * @typedef {Object} Source
 * @property {string} id
 * @property {string} nom
 * @property {string} licence
 * @property {(motNormalise: string) => Promise<Pictogramme[]>} chercher
 */
