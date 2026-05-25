/**
 * ============================================================
 * Script : sync-medias.mjs
 * Rôle  : Copie les fichiers de /src/medias/{images,icones,polices}
 *         vers /assets/ à plat avec préfixe (Shopify n'autorise
 *         pas les sous-dossiers dans /assets/).
 *
 * Mapping :
 *   src/medias/images/hero.jpg     →  assets/img-hero.jpg
 *   src/medias/icones/panier.svg   →  assets/icone-panier.svg
 *   src/medias/polices/inter.woff2 →  assets/police-inter.woff2
 * ============================================================
 */

import { readdir, copyFile, mkdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const RACINE = new URL('../src/medias/', import.meta.url);
const SORTIE = new URL('../assets/', import.meta.url);

// Sous-dossier source → préfixe de sortie
const MAPPING = {
  images: 'img-',
  icones: 'icone-',
  polices: 'police-',
};

async function copierDossier(sousDossier, prefixe) {
  const chemin = new URL(`${sousDossier}/`, RACINE);
  let fichiers;
  try {
    fichiers = await readdir(chemin);
  } catch {
    return 0;
  }

  let copies = 0;
  for (const nom of fichiers) {
    if (nom.startsWith('.')) continue; // ignore .gitkeep & co
    const source = new URL(nom, chemin);
    const infos = await stat(source);
    if (!infos.isFile()) continue;

    const destination = new URL(`${prefixe}${nom}`, SORTIE);
    await copyFile(source, destination);
    copies += 1;
    console.log(`  ✓ ${sousDossier}/${nom} → assets/${prefixe}${nom}`);
  }
  return copies;
}

async function principal() {
  await mkdir(SORTIE, { recursive: true });
  console.log('Synchronisation des médias src/medias/ → assets/');

  let total = 0;
  for (const [dossier, prefixe] of Object.entries(MAPPING)) {
    total += await copierDossier(dossier, prefixe);
  }

  console.log(`✓ Terminé — ${total} fichier(s) synchronisé(s).`);
}

principal().catch((erreur) => {
  console.error('✗ Échec de la synchronisation :', erreur);
  process.exit(1);
});
