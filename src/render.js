// Affiche la bande de pictogrammes et gère le choix d'une alternative par mot.

function creerCase(motResultat, index, onChoisir) {
  const case_ = document.createElement("div");
  case_.className = "picto-case";

  if (motResultat.ecarte) {
    case_.classList.add("picto-case--ecarte");
    case_.innerHTML = `<span class="picto-mot-ecarte">${motResultat.motOriginal}</span>`;
    return case_;
  }

  if (motResultat.pictogrammes.length === 0) {
    case_.classList.add("picto-case--absent");
    case_.innerHTML = `
      <div class="picto-absent" aria-hidden="true">?</div>
      <div class="picto-etiquette">${motResultat.motOriginal}</div>
    `;
    return case_;
  }

  const choixActuel = motResultat.choixIndex ?? 0;
  const picto = motResultat.pictogrammes[choixActuel];

  const img = document.createElement("img");
  img.src = picto.image;
  img.alt = picto.etiquette;
  img.className = "picto-image";
  img.loading = "lazy";
  case_.appendChild(img);

  const etiquette = document.createElement("div");
  etiquette.className = "picto-etiquette";
  etiquette.textContent = picto.etiquette;
  case_.appendChild(etiquette);

  const source = document.createElement("div");
  source.className = "picto-source";
  source.textContent = picto.source;
  case_.appendChild(source);

  if (motResultat.pictogrammes.length > 1) {
    const alternatives = document.createElement("div");
    alternatives.className = "picto-alternatives";
    alternatives.setAttribute("role", "group");
    alternatives.setAttribute("aria-label", `Choisir un pictogramme pour "${motResultat.motOriginal}"`);

    motResultat.pictogrammes.forEach((alt, i) => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "picto-alt-bouton";
      if (i === choixActuel) bouton.classList.add("picto-alt-bouton--actif");
      bouton.setAttribute("aria-pressed", String(i === choixActuel));
      bouton.setAttribute("aria-label", `${alt.etiquette} (${alt.source})`);

      const miniature = document.createElement("img");
      miniature.src = alt.image;
      miniature.alt = "";
      miniature.loading = "lazy";
      bouton.appendChild(miniature);

      bouton.addEventListener("click", () => onChoisir(index, i));
      alternatives.appendChild(bouton);
    });

    case_.appendChild(alternatives);
  }

  return case_;
}

/**
 * @param {HTMLElement} conteneur
 * @param {Array} resultats sortie de translate.js, éventuellement enrichie de choixIndex
 * @param {(index: number, choixIndex: number) => void} onChoisir appelé quand l'utilisateur choisit une alternative
 */
export function afficherBande(conteneur, resultats, onChoisir) {
  conteneur.innerHTML = "";
  if (resultats.length === 0) {
    conteneur.innerHTML = `<p class="bande-vide">Tapez une phrase ci-dessus pour voir la bande de pictogrammes.</p>`;
    return;
  }
  resultats.forEach((motResultat, index) => {
    conteneur.appendChild(creerCase(motResultat, index, onChoisir));
  });
}
