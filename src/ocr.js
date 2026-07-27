// Enrobage de Tesseract.js (chargé via CDN dans index.html, expose `window.Tesseract`).
// Texte imprimé uniquement en v1 (voir CLAUDE.md §2 et §11).
//
// Le worker est créé une seule fois puis réutilisé : le recréer à chaque
// lecture retéléchargerait/réinitialiserait inutilement le moteur (~10 Mo)
// à chaque clic, ce qui rendait chaque tentative très lente. Le callback de
// progression passé à createWorker() est fixé à la création : on le fait
// donc suivre un pointeur mis à jour à chaque appel de lireTexte().
let onProgressionActuelle = null;

let workerPromise = null;
function obtenirWorker() {
  if (!workerPromise) {
    workerPromise = window.Tesseract.createWorker("fra", 1, {
      logger: (m) => {
        if (onProgressionActuelle) {
          onProgressionActuelle({ statut: m.status, progression: m.progress ?? 0 });
        }
      },
    });
  }
  return workerPromise;
}

/**
 * @param {string} imageDataUrl
 * @param {(info: { statut: string, progression: number }) => void} [onProgression]
 * @returns {Promise<string>} texte reconnu (non corrigé, à relire par l'utilisateur)
 */
export async function lireTexte(imageDataUrl, onProgression) {
  onProgressionActuelle = onProgression ?? null;
  const worker = await obtenirWorker();
  const { data } = await worker.recognize(imageDataUrl);
  return data.text.trim();
}
