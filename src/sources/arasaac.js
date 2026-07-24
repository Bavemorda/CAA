import { normaliserCle } from "../lemmatizer.js";

const INDEX_URL = "data/index-arasaac.json";
const IMAGE_URL = (id) => `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;

let indexPromise = null;
function chargerIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL).then((res) => {
      if (!res.ok) throw new Error(`Index ARASAAC introuvable (HTTP ${res.status})`);
      return res.json();
    });
  }
  return indexPromise;
}

export const arasaacSource = {
  id: "arasaac",
  nom: "ARASAAC",
  licence: "CC BY-NC-SA — Gouvernement d'Aragon (arasaac.org)",
  async chercher(motNormalise) {
    const index = await chargerIndex();
    const entrees = index[normaliserCle(motNormalise)];
    if (!entrees) return [];
    return entrees.map((e) => ({
      image: IMAGE_URL(e.id),
      etiquette: e.label,
      source: "arasaac",
    }));
  },
};
