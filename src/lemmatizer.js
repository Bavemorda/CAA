// Lemmatisation : ramène un mot fléchi à sa forme de base ("chevaux" -> "cheval").
// S'appuie sur data/fr-lemmes.json (dictionnaire embarqué, voir
// scripts/build-lemmes.mjs). Pas de modèle : dictionnaire + règles de repli.

const TABLE_URL = "data/fr-lemmes.json";

let tablePromise = null;
function chargerTable() {
  if (!tablePromise) {
    tablePromise = fetch(TABLE_URL).then((res) => {
      if (!res.ok) throw new Error(`Table de lemmatisation introuvable (HTTP ${res.status})`);
      return res.json();
    });
  }
  return tablePromise;
}

/** Normalise une clé de recherche : minuscules, sans accents, ponctuation retirée. */
export function normaliserCle(mot) {
  return mot
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9' -]/g, "")
    .trim();
}

/** Nettoie un mot brut issu du texte (ponctuation collée, apostrophes typographiques). */
function nettoyerMot(mot) {
  return mot
    .replace(/’/g, "'")
    .replace(/^[.,;:!?"'«»()\[\]]+|[.,;:!?"'«»()\[\]]+$/g, "")
    .trim();
}

/**
 * Normalise un mot pour comparaison (minuscules, ponctuation retirée) sans
 * toucher aux accents. Contrairement à normaliserCle (qui sert d'index de
 * recherche et doit être tolérant), cette fonction doit distinguer des mots
 * différents comme "où" et "ou" — utilisée pour la liste des petits mots et
 * pour repérer la correspondance exacte parmi plusieurs pictogrammes.
 */
export function normaliserMot(mot) {
  return nettoyerMot(mot).toLowerCase();
}

/**
 * Donne la ou les formes candidates pour un mot : le lemme trouvé dans le
 * dictionnaire en premier (conformément au principe « lemmatisation puis
 * recherche », voir CLAUDE.md §3), la forme telle quelle ensuite, puis des
 * repliements simples (pluriel/féminin réguliers). Chercher le lemme en
 * priorité évite par exemple qu'un mot conjugué comme "est" (-> "être") ne
 * tombe d'abord sur un homographe sans rapport (le point cardinal "Est").
 * L'appelant essaie ces candidats dans l'ordre jusqu'à ce qu'une banque de
 * pictogrammes réponde.
 */
export async function lemmatiser(motBrut) {
  const mot = nettoyerMot(motBrut);
  if (!mot) return [];

  const table = await chargerTable();
  const cle = normaliserCle(mot);
  const candidats = [];

  const lemme = table[cle];
  if (lemme && lemme !== cle) candidats.push(lemme);
  candidats.push(mot);

  // Repli : pluriel régulier (-s / -x)
  if (cle.endsWith("s") || cle.endsWith("x")) {
    const singulier = cle.slice(0, -1);
    if (singulier.length > 1) candidats.push(singulier);
  }
  // Repli : féminin régulier (-e)
  if (cle.endsWith("e") && cle.length > 2) {
    const masculin = cle.slice(0, -1);
    candidats.push(masculin);
  }

  // Dédoublonne en conservant l'ordre
  return [...new Set(candidats)];
}
