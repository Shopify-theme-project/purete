# Thème Shopify — Pureté

Thème sur-mesure pour une marque **clean & beauty**.
Développé from scratch avec **Tailwind CSS**, **esbuild**, **Theme Check** et **Shopify CLI**.

---

## 📁 Architecture

```
purete/
├── assets/                  Fichiers statiques servis par Shopify (à plat !)
│   ├── img-*.{jpg,png,webp} Images (préfixe img-)
│   ├── icone-*.svg          Icônes SVG (préfixe icone-)
│   ├── police-*.woff2       Polices web (préfixe police-)
│   ├── application.css      ← généré par Tailwind (ne pas éditer)
│   └── application.js       ← généré par esbuild (ne pas éditer)
├── config/                  Réglages du thème (settings_schema / settings_data)
├── layout/                  Layouts racine (theme.liquid, password.liquid)
├── locales/                 Traductions FR (défaut) + EN
├── sections/                Sections éditables dans le Theme Editor
├── snippets/                Composants Liquid réutilisables
├── templates/               Templates JSON associant sections aux pages
├── src/                     Sources avant compilation
│   ├── medias/              Organisation claire avant aplatissement
│   │   ├── images/          → /assets/img-*
│   │   ├── icones/          → /assets/icone-*
│   │   └── polices/         → /assets/police-*
│   ├── styles/              CSS Tailwind source
│   └── scripts/             JS source bundlé par esbuild
├── scripts/                 Scripts Node de build (sync-medias.mjs…)
├── .github/workflows/       CI : lint + theme-check
├── .vscode/                 Réglages d'éditeur partagés
└── package.json
```

> **⚠️ Limitation Shopify** — Le dossier `/assets/` ne supporte **pas** de sous-dossiers. Nous travaillons dans `src/medias/` (clair, organisé) et le script `npm run assets:sync` aplatit tout vers `/assets/` avec un préfixe (`img-`, `icone-`, `police-`).

> **Note** — Les noms de dossiers racine (`assets`, `sections`, etc.) sont imposés par Shopify et doivent rester en anglais. Tous les fichiers internes, sous-dossiers et commentaires sont en **français**.

---

## 🚀 Démarrage

### 1. Prérequis

- [Node.js](https://nodejs.org/) ≥ 20
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) ≥ 3.66
- Compte partenaire Shopify et store de dev connecté

### 2. Installation

```bash
npm install
```

### 3. Connexion au store

```bash
shopify auth login
shopify theme dev --store=ton-store.myshopify.com
```

### 4. Développement local

```bash
npm run dev
```

Cette commande lance en parallèle :

- `tailwindcss --watch` → recompile `assets/application.css`
- `esbuild --watch` → recompile `assets/application.js`
- `shopify theme dev` → preview en local avec hot reload

### 5. Build production

```bash
npm run build
```

### 6. Publication

```bash
npm run shopify:push
```

---

## ✅ Qualité de code

| Commande              | Rôle                                        |
| --------------------- | ------------------------------------------- |
| `npm run lint`        | Lance tous les linters                      |
| `npm run lint:theme`  | Theme Check (règles Shopify)                |
| `npm run lint:js`     | ESLint sur `src/`                           |
| `npm run lint:css`    | Stylelint sur `src/`                        |
| `npm run format`      | Reformate tout le projet via Prettier       |

Les extensions VS Code recommandées sont listées dans `.vscode/extensions.json`.

---

## 🌍 Multilingue

- `locales/fr.default.json` → langue par défaut
- `locales/en.json` → anglais
- `locales/*.schema.json` → libellés du Theme Editor

Pour ajouter une langue, créer le fichier `locales/xx.json` et l'activer dans **Boutique en ligne → Préférences → Langues**.

---

## 📝 Conventions

1. **Code lisible et structuré** — fichiers courts, un seul rôle par section/snippet.
2. **Noms en français** pour tous les fichiers du thème, sauf ceux imposés par Shopify.
3. **Images isolées** dans `src/medias/images/` (aplatissement automatique vers `/assets/img-*`).
4. **Commentaires en français**, format `{%- comment -%}...{%- endcomment -%}` en Liquid.
5. **Aucune image/CSS/JS** ne doit être committée si elle est générée par le build.

---

## 🎨 Charte graphique

### Palette

| Token Tailwind | Hex | Usage |
| --- | --- | --- |
| `creme` | `#F2EADB` | Fond principal |
| `ivoire` | `#FAF5EB` | Cartes, zones secondaires |
| `sauge` | `#A8B89D` | Top bar, sections accent |
| `sauge-fonce` | `#8A9D7E` | Hover, états actifs |
| `vert-profond` | `#1F2D2A` | Boutons, titres, texte fort |
| `gris-doux` | `#6B6B6B` | Texte secondaire |
| `or` | `#D4A656` | Étoiles d'avis, accents premium |

### Typographie

| Famille | Police | Usage |
| --- | --- | --- |
| `font-titre` | **Cormorant Garamond** (400 / 400 italic / 500) | Logo, titres H1/H3, citations |
| `font-corps` | **Inter** (400 / 500 / 600) | Corps, navigation, boutons, prix |

### Installer les polices (auto-hébergement)

Les polices sont **auto-hébergées** (perf + conformité RGPD). À récupérer une seule fois :

1. Aller sur [google-webfonts-helper](https://gwfh.mranftl.com/fonts).
2. Télécharger **Cormorant Garamond** avec les graisses `400, 400italic, 500`, format **woff2 uniquement**.
3. Télécharger **Inter** avec les graisses `400, 500, 600`, format **woff2 uniquement**.
4. Renommer chaque fichier selon la convention et les placer dans `src/medias/polices/` :

```
src/medias/polices/
├── cormorant-400.woff2
├── cormorant-400-italic.woff2
├── cormorant-500.woff2
├── inter-400.woff2
├── inter-500.woff2
└── inter-600.woff2
```

5. Lancer la synchronisation :

```bash
npm run assets:sync
```

Les fichiers seront copiés vers `/assets/police-*.woff2` (préfixe ajouté automatiquement).

---

## 🌿 Workflow Git suggéré

- `main` → production (déployée)
- `develop` → intégration
- `feature/xxx` → branches de fonctionnalité

Chaque PR déclenche `.github/workflows/qualite-theme.yml` (lint + theme-check).
