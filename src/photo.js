// Convertit un fichier image (saisi par l'utilisateur) en data URL JPEG,
// redimensionnée si trop grande. Sert à la fois pour l'OCR et pour l'export PDF.
// Limite connue (voir CLAUDE.md) : l'orientation EXIF n'est pas corrigée, une
// photo prise verticalement sur certains téléphones peut apparaître pivotée.

const DIMENSION_MAX = 1600;

export function fichierVersDataUrl(fichier) {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const img = new Image();
      img.onload = () => {
        let largeur = img.naturalWidth;
        let hauteur = img.naturalHeight;
        if (Math.max(largeur, hauteur) > DIMENSION_MAX) {
          const ratio = DIMENSION_MAX / Math.max(largeur, hauteur);
          largeur = Math.round(largeur * ratio);
          hauteur = Math.round(hauteur * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = largeur;
        canvas.height = hauteur;
        canvas.getContext("2d").drawImage(img, 0, 0, largeur, hauteur);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = lecteur.result;
    };
    lecteur.onerror = () => reject(new Error("Fichier illisible"));
    lecteur.readAsDataURL(fichier);
  });
}
