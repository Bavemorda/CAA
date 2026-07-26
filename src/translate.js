// Pipeline complet : texte -> bande de pictogrammes.
// texte -> découpage en mots -> lemmatisation -> filtrage des petits mots
//       -> recherche dans la/les source(s) -> résultat par mot (avec alternatives)

import { lemmatiser, normaliserCle, normaliserMot } from "./lemmatizer.js";

let stopwordsPromise = null;
function chargerStopwords() {
  if (!stopwordsPromise) {
    stopwordsPromise = fetch("data/stopwords-fr.json").then((res) => res.json());
  }
  return stopwordsPromise;
}

function decouper(texte) {
  return texte
    .split(/\s+/)
    .map((m) => m.trim())
    .filter(Boolean);
}

/**
 * @param {string} texte
 * @param {import('./sources/source.js').Source[]} sources banques actives, dans l'ordre d'affichage
 * @param {{ motAMot?: boolean }} options motAMot=true garde aussi les petits mots
 * @returns {Promise<Array<{ motOriginal: string, lemme: string, ecarte: boolean, pictogrammes: import('./sources/source.js').Pictogramme[] }>>}
 */
export async function traduire(texte, sources, options = {}) {
  const stopwords = await chargerStopwords();
  const mots = decouper(texte);

  const resultat = [];
  for (const motOriginal of mots) {
    // Comparaison qui respecte les accents : "où" et "ou" sont deux mots
    // différents, alors que normaliserCle (index de recherche) les confond
    // volontairement pour tolérer les fautes d'accent lors de la recherche.
    const motSimple = normaliserMot(motOriginal);
    const estPetitMot = stopwords.includes(motSimple);

    if (estPetitMot && !options.motAMot) {
      resultat.push({ motOriginal, lemme: motSimple, ecarte: true, pictogrammes: [] });
      continue;
    }

    const candidats = await lemmatiser(motOriginal);
    let pictogrammes = [];
    let lemmeTrouve = candidats[0] ?? normaliserCle(motOriginal);

    for (const candidat of candidats) {
      const parSource = await Promise.all(sources.map((s) => s.chercher(candidat)));
      const trouves = parSource.flat();
      if (trouves.length > 0) {
        // Si plusieurs pictogrammes partagent la même clé sans accent (ex.
        // "où"/"ou"), on met en premier celui dont l'étiquette correspond
        // exactement au mot recherché ; les autres restent proposés en
        // alternative (choix par mot, voir CLAUDE.md §3).
        const candidatSimple = normaliserMot(candidat);
        trouves.sort((a, b) => {
          const aExact = normaliserMot(a.etiquette) === candidatSimple ? 0 : 1;
          const bExact = normaliserMot(b.etiquette) === candidatSimple ? 0 : 1;
          return aExact - bExact;
        });
        pictogrammes = trouves;
        lemmeTrouve = candidat;
        break;
      }
    }

    resultat.push({ motOriginal, lemme: lemmeTrouve, ecarte: false, pictogrammes });
  }

  return resultat;
}
