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
});
