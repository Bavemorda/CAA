// Construit /data/index-mulberry.json à partir du vocabulaire français choisi
// (scripts/mulberry-fr-vocab.mjs) et du dépôt officiel mulberrysymbols/mulberry-symbols,
// servi via le CDN jsDelivr (pas d'API dédiée côté Mulberry).
// Usage : node scripts/build-index-mulberry.mjs

import { writeFile } from "node:fs/promises";
import { MULBERRY_VOCAB } from "./mulberry-fr-vocab.mjs";

const REPO = "mulberrysymbols/mulberry-symbols";
const VERSION = "3.6.0";
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${VERSION}/EN/`;
const OUT_FILE = new URL("../data/index-mulberry.json", import.meta.url);

function normaliser(motCle) {
  return motCle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9' -]/g, "")
    .trim();
}

async function fichierExiste(nomFichier) {
  const res = await fetch(CDN_BASE + encodeURIComponent(nomFichier), { method: "HEAD" });
  return res.ok;
}

async function main() {
  const totalCandidats = MULBERRY_VOCAB.reduce((n, [, fichiers]) => n + fichiers.length, 0);
  console.log(`Vérification de ${totalCandidats} fichiers Mulberry candidats sur jsDelivr...`);
  const index = {};
  let ok = 0;
  let motsSansImage = [];

  for (const [motFr, fichiers] of MULBERRY_VOCAB) {
    const cle = normaliser(motFr);
    let trouve = 0;
    for (const fichier of fichiers) {
      const existe = await fichierExiste(fichier);
      if (!existe) continue;
      if (!index[cle]) index[cle] = [];
      index[cle].push({ fichier, label: motFr });
      ok++;
      trouve++;
    }
    if (!trouve) motsSansImage.push(motFr);
  }

  const sortedIndex = Object.fromEntries(
    Object.entries(index).sort(([a], [b]) => a.localeCompare(b, "fr"))
  );

  await writeFile(OUT_FILE, JSON.stringify(sortedIndex), "utf-8");
  console.log(`Index écrit : ${Object.keys(sortedIndex).length} mots, ${ok} images.`);
  if (motsSansImage.length) {
    console.log(`Mots sans image trouvée (${motsSansImage.length}) :`, motsSansImage.join(", "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
