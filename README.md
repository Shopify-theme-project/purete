# Thème Shopify — Pureté

Thème sur-mesure pour une marque **clean & beauty**.
Développé from scratch avec **Tailwind CSS**, **esbuild**, **Theme Check** et **Shopify CLI**.

---

## 📁 Architecture

```
purete/
├── assets/                  Assets statiques servis par Shopify
│   ├── images/              Toutes les images du thème
│   ├── icones/              Icônes SVG (utilisées via snippet `icone`)
│   ├── polices/             Polices web
│   ├── application.css      ← généré par Tailwind (ne pas éditer)
│   └── application.js       ← généré par esbuild (ne pas éditer)
├── config/                  Réglages du thème (settings_schema / settings_data)
├── layout/                  Layouts racine (theme.liquid, password.liquid)
├── locales/                 Traductions FR (défaut) + EN
├── sections/                Sections éditables dans le Theme Editor
├── snippets/                Composants Liquid réutilisables
├── templates/               Templates JSON associant sections aux pages
├── src/                     Sources avant compilation
│   ├── styles/              CSS Tailwind source
│   └── scripts/             JS source bundlé par esbuild
├── .github/workflows/       CI : lint + theme-check
├── .vscode/                 Réglages d'éditeur partagés
└── package.json
```

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
3. **Images isolées** dans `assets/images/` (jamais à la racine de `assets/`).
4. **Commentaires en français**, format `{%- comment -%}...{%- endcomment -%}` en Liquid.
5. **Aucune image/CSS/JS** ne doit être committée si elle est générée par le build.

---

## 🌿 Workflow Git suggéré

- `main` → production (déployée)
- `develop` → intégration
- `feature/xxx` → branches de fonctionnalité

Chaque PR déclenche `.github/workflows/qualite-theme.yml` (lint + theme-check).
