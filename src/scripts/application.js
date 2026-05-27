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

document.addEventListener('DOMContentLoaded', () => {
  console.info('[Pureté] Thème initialisé');
  synchroniserPanier();
  initAjoutRapide();
});
