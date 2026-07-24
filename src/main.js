import { traduire } from "./translate.js";
import { afficherBande } from "./render.js";
import { arasaacSource } from "./sources/arasaac.js";
import { mulberrySource } from "./sources/mulberry.js";
import { lireTexte } from "./ocr.js";
import { fichierVersDataUrl } from "./photo.js";
import { exporterPdf } from "./export.js";

// Registre des banques disponibles. Ajouter une banque = ajouter une ligne ici
// (et un fichier dans src/sources/ qui respecte l'interface de source.js).
const SOURCES_DISPONIBLES = [arasaacSource, mulberrySource];

const form = document.getElementById("form-phrase");
const champPhrase = document.getElementById("champ-phrase");
const conteneurBande = document.getElementById("bande");
const caseBanques = document.getElementById("choix-banques");
const caseMotAMot = document.getElementById("choix-mot-a-mot");
const zoneLicences = document.getElementById("licences");

const champPhoto = document.getElementById("champ-photo");
const apercuPhoto = document.getElementById("apercu-photo");
const apercuPhotoImage = document.getElementById("apercu-photo-image");
const boutonLirePhoto = document.getElementById("bouton-lire-photo");
const statutOcr = document.getElementById("statut-ocr");
const boutonExportPdf = document.getElementById("bouton-export-pdf");

let dernierResultat = [];
let photoActuelleDataUrl = null;

function sourcesActives() {
  const cases = caseBanques.querySelectorAll("input[type=checkbox]:checked");
  const ids = [...cases].map((c) => c.value);
  return SOURCES_DISPONIBLES.filter((s) => ids.includes(s.id));
}

function afficherLicences(sources) {
  zoneLicences.innerHTML = sources
    .map((s) => `<span class="licence-item"><strong>${s.nom}</strong> : ${s.licence}</span>`)
    .join(" · ");
}

async function lancerTraduction() {
  const texte = champPhrase.value.trim();
  const sources = sourcesActives();
  afficherLicences(sources);

  if (!texte || sources.length === 0) {
    dernierResultat = [];
    afficherBande(conteneurBande, [], () => {});
    boutonExportPdf.disabled = true;
    return;
  }

  conteneurBande.innerHTML = `<p class="bande-chargement">Traduction en cours…</p>`;
  const motAMot = caseMotAMot.checked;
  dernierResultat = await traduire(texte, sources, { motAMot });
  afficherBande(conteneurBande, dernierResultat, onChoisirAlternative);
  boutonExportPdf.disabled = dernierResultat.length === 0;
}

function onChoisirAlternative(index, choixIndex) {
  dernierResultat[index].choixIndex = choixIndex;
  afficherBande(conteneurBande, dernierResultat, onChoisirAlternative);
}

form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  lancerTraduction();
});
caseBanques.addEventListener("change", lancerTraduction);
caseMotAMot.addEventListener("change", lancerTraduction);

// --- Photo -> OCR -----------------------------------------------------

champPhoto.addEventListener("change", async () => {
  const fichier = champPhoto.files[0];
  if (!fichier) return;
  statutOcr.textContent = "";
  photoActuelleDataUrl = await fichierVersDataUrl(fichier);
  apercuPhotoImage.src = photoActuelleDataUrl;
  apercuPhoto.hidden = false;
});

boutonLirePhoto.addEventListener("click", async () => {
  if (!photoActuelleDataUrl) return;
  boutonLirePhoto.disabled = true;
  statutOcr.textContent = "Lecture du texte en cours… (le premier essai télécharge le moteur OCR, ça peut prendre un moment)";
  try {
    const texte = await lireTexte(photoActuelleDataUrl, ({ statut, progression }) => {
      const pourcentage = Math.round(progression * 100);
      statutOcr.textContent = `${statut}… ${pourcentage}%`;
    });
    champPhrase.value = texte;
    statutOcr.textContent = texte
      ? "Texte reconnu ci-dessous : relisez-le et corrigez-le si besoin, puis cliquez sur « Traduire »."
      : "Aucun texte reconnu dans cette photo. Réessayez avec une photo plus nette, ou tapez la phrase directement.";
    champPhrase.focus();
  } catch (err) {
    statutOcr.textContent = "Erreur pendant la lecture de la photo : " + err.message;
  } finally {
    boutonLirePhoto.disabled = false;
  }
});

// --- Export PDF ---------------------------------------------------------

boutonExportPdf.addEventListener("click", async () => {
  if (dernierResultat.length === 0) return;
  boutonExportPdf.disabled = true;
  const texteInitial = boutonExportPdf.textContent;
  boutonExportPdf.textContent = "Préparation du PDF…";
  try {
    await exporterPdf({ photoDataUrl: photoActuelleDataUrl, resultats: dernierResultat });
  } catch (err) {
    alert("Impossible de générer le PDF : " + err.message);
  } finally {
    boutonExportPdf.disabled = false;
    boutonExportPdf.textContent = texteInitial;
  }
});

afficherLicences(sourcesActives());
afficherBande(conteneurBande, [], () => {});
