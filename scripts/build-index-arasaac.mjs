// Construit /data/index-arasaac.json à partir de l'API publique ARASAAC.
// À relancer une fois de temps en temps pour rafraîchir la banque (nouveaux pictogrammes).
// Usage : node scripts/build-index-arasaac.mjs

import { writeFile } from "node:fs/promises";

const SOURCE_URL = "https://api.arasaac.org/api/pictograms/all/fr";
const OUT_FILE = new URL("../data/index-arasaac.json", import.meta.url);

function normaliser(motCle) {
  return motCle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enlève les accents pour la clé d'index
    .replace(/[^a-z0-9' -]/g, "")
    .trim();
}

async function main() {
  console.log("Téléchargement de la banque ARASAAC (français)...");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Échec du téléchargement : HTTP ${res.status}`);
  const pictos = await res.json();
  console.log(`${pictos.length} pictogrammes reçus.`);

  const index = {};
  let nbMots = 0;

  for (const p of pictos) {
    // On écarte les pictogrammes marqués violence/sexe : outil destiné à la CAA (enfants et adultes).
    if (p.violence || p.sex) continue;
    if (!Array.isArray(p.keywords)) continue;

    for (const k of p.keywords) {
      if (!k.keyword) continue;
      const cle = normaliser(k.keyword);
      if (!cle) continue;
      if (!index[cle]) index[cle] = [];
      // Évite les doublons (même id déjà présent sur cette clé)
      if (!index[cle].some((entry) => entry.id === p._id)) {
        index[cle].push({ id: p._id, label: k.keyword });
        nbMots++;
      }
    }
  }

  const sortedIndex = Object.fromEntries(
    Object.entries(index).sort(([a], [b]) => a.localeCompare(b, "fr"))
  );

  await writeFile(OUT_FILE, JSON.stringify(sortedIndex), "utf-8");
  console.log(`Index écrit : ${Object.keys(sortedIndex).length} clés, ${nbMots} associations mot→pictogramme.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
