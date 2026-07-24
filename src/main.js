import { traduire } from "./translate.js";
import { afficherBande } from "./render.js";
import { arasaacSource } from "./sources/arasaac.js";
import { mulberrySource } from "./sources/mulberry.js";

// Registre des banques disponibles. Ajouter une banque = ajouter une ligne ici
// (et un fichier dans src/sources/ qui respecte l'interface de source.js).
const SOURCES_DISPONIBLES = [arasaacSource, mulberrySource];

const form = document.getElementById("form-phrase");
const champPhrase = document.getElementById("champ-phrase");
const conteneurBande = document.getElementById("bande");
const caseBanques = document.getElementById("choix-banques");
const caseMotAMot = document.getElementById("choix-mot-a-mot");
const zoneLicences = document.getElementById("licences");

let dernierResultat = [];

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
    return;
  }

  conteneurBande.innerHTML = `<p class="bande-chargement">Traduction en cours…</p>`;
  const motAMot = caseMotAMot.checked;
  dernierResultat = await traduire(texte, sources, { motAMot });
  afficherBande(conteneurBande, dernierResultat, onChoisirAlternative);
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

afficherLicences(sourcesActives());
afficherBande(conteneurBande, [], () => {});
