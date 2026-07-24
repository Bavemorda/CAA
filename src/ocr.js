// Enrobage de Tesseract.js (chargé via CDN dans index.html, expose `window.Tesseract`).
// Texte imprimé uniquement en v1 (voir CLAUDE.md §2 et §11).

/**
 * @param {string} imageDataUrl
 * @param {(info: { statut: string, progression: number }) => void} [onProgression]
 * @returns {Promise<string>} texte reconnu (non corrigé, à relire par l'utilisateur)
 */
export async function lireTexte(imageDataUrl, onProgression) {
  const worker = await window.Tesseract.createWorker("fra", 1, {
    logger: (m) => {
      if (onProgression) onProgression({ statut: m.status, progression: m.progress ?? 0 });
    },
  });
  try {
    const { data } = await worker.recognize(imageDataUrl);
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
}
