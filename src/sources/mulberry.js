import { normaliserCle } from "../lemmatizer.js";

const INDEX_URL = "data/index-mulberry.json";
const REPO = "mulberrysymbols/mulberry-symbols";
const VERSION = "3.6.0";
const IMAGE_URL = (fichier) =>
  `https://cdn.jsdelivr.net/gh/${REPO}@${VERSION}/EN/${encodeURIComponent(fichier)}`;

let indexPromise = null;
function chargerIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL).then((res) => {
      if (!res.ok) throw new Error(`Index Mulberry introuvable (HTTP ${res.status})`);
      return res.json();
    });
  }
  return indexPromise;
}

export const mulberrySource = {
  id: "mulberry",
  nom: "Mulberry",
  licence: "CC BY-SA — Steve Lee (mulberrysymbols.org)",
  async chercher(motNormalise) {
    const index = await chargerIndex();
    const entrees = index[normaliserCle(motNormalise)];
    if (!entrees) return [];
    return entrees.map((e) => ({
      image: IMAGE_URL(e.fichier),
      etiquette: e.label,
      source: "mulberry",
    }));
  },
};
