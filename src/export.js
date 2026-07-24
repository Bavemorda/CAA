// Export PDF : photo d'origine (si présente) en haut de page, bande de
// pictogrammes en dessous. jsPDF chargé via CDN (expose `window.jspdf.jsPDF`).

/** Charge une image (éventuellement distante) et la redessine en PNG local, pour l'intégrer au PDF. */
function rasteriser(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Image introuvable : ${url}`));
    img.src = url;
  });
}

/**
 * @param {Object} options
 * @param {string|null} options.photoDataUrl  photo d'origine (data URL), ou null si traduction sans photo
 * @param {Array} options.resultats sortie de translate.js (avec choixIndex éventuel)
 * @param {string} [options.nomFichier]
 */
export async function exporterPdf({ photoDataUrl, resultats, nomFichier = "traduction-pictogrammes.pdf" }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margeX = 15;
  const largeurPage = doc.internal.pageSize.getWidth();
  const hauteurPage = doc.internal.pageSize.getHeight();
  let y = 15;

  if (photoDataUrl) {
    const img = await chargerImage(photoDataUrl);
    const largeurMax = largeurPage - margeX * 2;
    const hauteurMax = hauteurPage * 0.55;
    let largeur = largeurMax;
    let hauteur = (largeur * img.naturalHeight) / img.naturalWidth;
    if (hauteur > hauteurMax) {
      hauteur = hauteurMax;
      largeur = (hauteur * img.naturalWidth) / img.naturalHeight;
    }
    const x = (largeurPage - largeur) / 2;
    doc.addImage(photoDataUrl, "JPEG", x, y, largeur, hauteur);
    y += hauteur + 10;
  }

  const taillePicto = 28; // mm
  const espace = 4;
  const hauteurCase = taillePicto + 10;
  const parLigne = Math.max(1, Math.floor((largeurPage - margeX * 2 + espace) / (taillePicto + espace)));
  let col = 0;

  const motsAffiches = resultats.filter((m) => !m.ecarte);

  for (const mot of motsAffiches) {
    if (y + hauteurCase > hauteurPage - 10) {
      doc.addPage();
      y = 15;
      col = 0;
    }
    const x = margeX + col * (taillePicto + espace);
    const picto = mot.pictogrammes[mot.choixIndex ?? 0];

    if (picto) {
      try {
        const dataUrl = await rasteriser(picto.image);
        doc.addImage(dataUrl, "PNG", x, y, taillePicto, taillePicto);
      } catch {
        doc.setDrawColor(180);
        doc.rect(x, y, taillePicto, taillePicto);
      }
    } else {
      doc.setDrawColor(180);
      doc.rect(x, y, taillePicto, taillePicto);
    }

    doc.setFontSize(8);
    doc.setTextColor(40);
    doc.text(mot.motOriginal, x + taillePicto / 2, y + taillePicto + 4, {
      align: "center",
      maxWidth: taillePicto + espace,
    });

    col++;
    if (col >= parLigne) {
      col = 0;
      y += hauteurCase;
    }
  }

  doc.save(nomFichier);
}

function chargerImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
