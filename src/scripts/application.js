/**
 * Script principal du thème Pureté.
 * Point d'entrée bundlé vers /assets/application.js par esbuild.
 */

/**
 * Met à jour le badge du panier dans l'en-tête après ajout.
 * @param {number} nb - Nombre d'articles total dans le panier.
 */
function mettreAJourBadgePanier(nb) {
  const badge = document.querySelector('[data-compteur-panier]');
  if (!badge) return;
  badge.textContent = nb;
  badge.classList.toggle('hidden', nb === 0);
}

/**
 * Récupère le panier actuel pour synchroniser le badge au chargement.
 */
async function synchroniserPanier() {
  try {
    const reponse = await fetch('/cart.js');
    if (!reponse.ok) return;
    const panier = await reponse.json();
    mettreAJourBadgePanier(panier.item_count);
  } catch (erreur) {
    console.warn('[Pureté] Impossible de récupérer le panier', erreur);
  }
}

/**
 * Gère le clic sur un bouton "Ajouter vite" :
 * ajoute la variante via /cart/add.js, met à jour le badge,
 * affiche un retour visuel temporaire.
 */
async function gererAjoutRapide(bouton) {
  if (bouton.disabled || bouton.classList.contains('est-en-cours')) return;

  const idVariante = bouton.dataset.idVariante;
  if (!idVariante || idVariante === '0') return;

  const libelle = bouton.querySelector('span');
  const texteOriginal = libelle ? libelle.textContent : '';
  bouton.classList.add('est-en-cours');
  bouton.disabled = true;

  try {
    const reponse = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: idVariante, quantity: 1 }),
    });

    if (!reponse.ok) {
      throw new Error(`Erreur ${reponse.status}`);
    }

    const panier = await fetch('/cart.js').then((r) => r.json());
    mettreAJourBadgePanier(panier.item_count);

    bouton.classList.remove('est-en-cours');
    bouton.classList.add('est-ajoute');
    if (libelle) libelle.textContent = 'Ajouté ✓';

    setTimeout(() => {
      bouton.classList.remove('est-ajoute');
      bouton.disabled = false;
      if (libelle) libelle.textContent = texteOriginal;
    }, 1800);
  } catch (erreur) {
    console.error('[Pureté] Échec de l\'ajout au panier', erreur);
    bouton.classList.remove('est-en-cours');
    bouton.disabled = false;
    if (libelle) {
      libelle.textContent = 'Erreur';
      setTimeout(() => { libelle.textContent = texteOriginal; }, 1800);
    }
  }
}

/**
 * Délégation d'événement pour tous les boutons d'ajout rapide.
 */
function initAjoutRapide() {
  document.addEventListener('click', (event) => {
    const bouton = event.target.closest('[data-quick-add]');
    if (!bouton) return;
    event.preventDefault();
    gererAjoutRapide(bouton);
  });
}

/**
 * Active les animations à l'apparition au scroll pour tous les éléments
 * portant l'attribut [data-anim-au-scroll]. Utilise IntersectionObserver
 * pour ne déclencher qu'une fois quand l'élément entre dans le viewport.
 */
function initAnimationsAuScroll() {
  const elements = document.querySelectorAll('[data-anim-au-scroll]');
  if (elements.length === 0) return;

  // Si l'utilisateur préfère réduire les animations, on rend tout visible immédiatement.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((el) => el.classList.add('est-visible'));
    return;
  }

  // Fallback : si IntersectionObserver n'existe pas, on affiche tout.
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('est-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (entree.isIntersecting) {
          entree.target.classList.add('est-visible');
          observer.unobserve(entree.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -10% 0px' }
  );

  elements.forEach((el) => observer.observe(el));

  // Filet de sécurité : si pour une raison quelconque l'observer ne déclenche
  // pas (ex. élément déjà entièrement dans le viewport au chargement),
  // on force la visibilité au bout de 1,5s.
  setTimeout(() => {
    elements.forEach((el) => el.classList.add('est-visible'));
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  console.info('[Pureté] Thème initialisé');
  synchroniserPanier();
  initAjoutRapide();
  initAnimationsAuScroll();
  initGalerieProduit();
  initSelecteurVariantes();
  initStepper();
  initFormulaireProduit();
  initAvisVoirPlus();
});

/* ============================================================
   Page produit (PDP)
   ============================================================ */

/**
 * Galerie produit : swap de l'image principale au clic sur une vignette.
 */
function initGalerieProduit() {
  const galeries = document.querySelectorAll('[data-galerie]');
  galeries.forEach((galerie) => {
    const vignettes = galerie.querySelectorAll('[data-vignette]');
    const slides = galerie.querySelectorAll('[data-slide]');
    if (vignettes.length === 0) return;

    vignettes.forEach((vignette) => {
      vignette.addEventListener('click', () => {
        const idCible = vignette.dataset.mediaId;
        vignettes.forEach((v) => {
          const actif = v.dataset.mediaId === idCible;
          v.classList.toggle('est-active', actif);
          v.setAttribute('aria-selected', actif ? 'true' : 'false');
        });
        slides.forEach((s) => {
          const actif = s.dataset.mediaId === idCible;
          s.classList.toggle('est-active', actif);
          if (actif) s.removeAttribute('aria-hidden');
          else s.setAttribute('aria-hidden', 'true');
        });
      });
    });
  });
}

/**
 * Sélecteur de variantes : met à jour variante courante, prix, URL,
 * image, état du bouton d'ajout panier.
 */
function initSelecteurVariantes() {
  const conteneurs = document.querySelectorAll('[data-selecteur-variantes]');
  conteneurs.forEach((conteneur) => {
    const scriptJson = conteneur.querySelector('[data-variantes-json]');
    if (!scriptJson) return;

    let variantes = [];
    try {
      variantes = JSON.parse(scriptJson.textContent);
    } catch (e) {
      console.warn('[Pureté] Impossible de parser les variantes', e);
      return;
    }

    const section = conteneur.closest('[data-section-produit]');
    const champIdVariante = conteneur.querySelector('[data-variante-id]');
    const conteneurPrix = section ? section.querySelector('[data-prix-conteneur]') : null;
    const elPrix = conteneurPrix ? conteneurPrix.querySelector('[data-prix]') : null;
    const elPrixCompare = conteneurPrix ? conteneurPrix.querySelector('[data-prix-compare]') : null;
    const boutonPanier = section ? section.querySelector('[data-bouton-panier]') : null;
    const texteBouton = boutonPanier ? boutonPanier.querySelector('[data-texte-bouton]') : null;
    const galerie = section ? section.querySelector('[data-galerie]') : null;

    function selectionnerOptionUI(input) {
      const groupe = input.closest('.selecteur-variantes__groupe');
      if (!groupe) return;
      groupe.querySelectorAll('.selecteur-variantes__pill').forEach((p) => p.classList.remove('est-active'));
      const pill = input.closest('.selecteur-variantes__pill');
      if (pill) pill.classList.add('est-active');
      const legende = groupe.querySelector('[data-valeur-active]');
      if (legende) legende.textContent = input.value;
    }

    function obtenirOptionsSelectionnees() {
      const options = [];
      conteneur.querySelectorAll('input[type="radio"]:checked').forEach((input) => {
        const idx = parseInt(input.dataset.optionIndex, 10);
        options[idx] = input.value;
      });
      return options;
    }

    function trouverVariante(optionsSelectionnees) {
      return variantes.find((v) => {
        return v.options.every((opt, i) => opt === optionsSelectionnees[i]);
      });
    }

    function formaterPrix(centimes) {
      const euros = (centimes / 100).toFixed(2).replace('.', ',');
      return `${euros}\u00A0€`;
    }

    function mettreAJourVariante() {
      const options = obtenirOptionsSelectionnees();
      const variante = trouverVariante(options);
      if (!variante) return;

      if (champIdVariante) champIdVariante.value = variante.id;

      // URL
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variante.id);
      window.history.replaceState({}, '', url.toString());

      // Prix
      if (elPrix) elPrix.textContent = formaterPrix(variante.price);
      if (elPrixCompare) {
        if (variante.compare_at_price && variante.compare_at_price > variante.price) {
          elPrixCompare.textContent = formaterPrix(variante.compare_at_price);
          elPrixCompare.hidden = false;
          if (elPrix) elPrix.classList.add('produit__prix-actuel--solde');
        } else {
          elPrixCompare.hidden = true;
          if (elPrix) elPrix.classList.remove('produit__prix-actuel--solde');
        }
      }

      // Disponibilité
      if (boutonPanier) {
        if (variante.available) {
          boutonPanier.disabled = false;
          if (texteBouton) texteBouton.textContent = 'Ajouter au panier';
        } else {
          boutonPanier.disabled = true;
          if (texteBouton) texteBouton.textContent = 'Rupture de stock';
        }
      }

      // Image associée
      if (galerie && variante.featured_media) {
        const idMedia = String(variante.featured_media.id);
        const vignetteCible = galerie.querySelector(`[data-vignette][data-media-id="${idMedia}"]`);
        if (vignetteCible) vignetteCible.click();
      }
    }

    conteneur.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        selectionnerOptionUI(input);
        mettreAJourVariante();
      });
    });

    // Permettre le clic sur le label/pill
    conteneur.querySelectorAll('.selecteur-variantes__pill').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const input = pill.querySelector('input[type="radio"]');
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  });
}

/**
 * Stepper de quantité : - / + avec borne min/max.
 */
function initStepper() {
  document.querySelectorAll('[data-stepper]').forEach((stepper) => {
    const input = stepper.querySelector('[data-stepper-input]');
    const moins = stepper.querySelector('[data-stepper-moins]');
    const plus = stepper.querySelector('[data-stepper-plus]');
    if (!input || !moins || !plus) return;

    const min = parseInt(input.min, 10) || 1;
    const max = input.max ? parseInt(input.max, 10) : Infinity;

    function maj(v) {
      let n = parseInt(v, 10);
      if (isNaN(n) || n < min) n = min;
      if (n > max) n = max;
      input.value = n;
      moins.disabled = n <= min;
      plus.disabled = n >= max;
    }

    moins.addEventListener('click', () => maj((parseInt(input.value, 10) || min) - 1));
    plus.addEventListener('click', () => maj((parseInt(input.value, 10) || min) + 1));
    input.addEventListener('change', () => maj(input.value));
    maj(input.value);
  });
}

/**
 * Formulaire produit : intercept submit, ajout AJAX au panier.
 */
function initFormulaireProduit() {
  document.querySelectorAll('[data-form-produit]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const bouton = form.querySelector('[data-bouton-panier]');
      if (!bouton || bouton.disabled) return;

      const texteBouton = bouton.querySelector('[data-texte-bouton]');
      const texteOriginal = texteBouton ? texteBouton.textContent : '';

      bouton.classList.add('est-en-cours');
      bouton.disabled = true;
      if (texteBouton) texteBouton.textContent = 'Ajout en cours…';

      try {
        const formData = new FormData(form);
        const reponse = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });

        if (!reponse.ok) {
          const erreur = await reponse.json().catch(() => ({}));
          throw new Error(erreur.description || `Erreur ${reponse.status}`);
        }

        const panier = await fetch('/cart.js').then((r) => r.json());
        mettreAJourBadgePanier(panier.item_count);

        bouton.classList.remove('est-en-cours');
        bouton.classList.add('est-ajoute');
        if (texteBouton) texteBouton.textContent = 'Ajouté au panier ✓';

        setTimeout(() => {
          bouton.classList.remove('est-ajoute');
          bouton.disabled = false;
          if (texteBouton) texteBouton.textContent = texteOriginal;
        }, 2200);
      } catch (erreur) {
        console.error('[Pureté] Échec ajout panier', erreur);
        bouton.classList.remove('est-en-cours');
        bouton.disabled = false;
        if (texteBouton) {
          texteBouton.textContent = 'Erreur, réessayez';
          setTimeout(() => { texteBouton.textContent = texteOriginal; }, 2200);
        }
      }
    });
  });
}

/**
 * Section avis clients : bouton "voir plus" qui révèle tous les avis cachés.
 */
function initAvisVoirPlus() {
  document.querySelectorAll('[data-avis-voir-plus]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const section = bouton.closest('.avis-clients');
      if (!section) return;
      section.querySelectorAll('[data-avis-item].est-cache').forEach((item) => {
        item.classList.remove('est-cache');
      });
      bouton.remove();
    });
  });
}
