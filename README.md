# JardinIrisAdmin4C

Application Angular 20 orchestrée avec [Nx](https://nx.dev) pour piloter le développement, les tests et l’architecture multi‑bibliothèques.

## Commandes usuelles

| Commande | Description |
| --- | --- |
| `npm run start` | Lance `nx serve JardinIrisAdmin4C` |
| `npm run build` | Compile l’app en production (`nx build`) |
| `npm run lint` | Vérifie le lint (`nx lint`) |
| `npm run test-single` | Lance la suite de tests Karma en headless |
| `npm run affected:build` | Build des projets impactés |
| `npm run affected:test` | Tests ciblés sur les projets modifiés |
| `npm run affected:lint` | Lint ciblé |
| `npm run graph` | Visualise le graphe de dépendances Nx |

## Architecture Nx

```
apps/
└── (app principale en mode standalone)

libs/
├── core/data-access   → Services métiers partagés (Supabase, logging, erreurs…)
├── shared/ui          → Composants UI transverses (ex. VersionsComponent)
├── shared/util        → Utilitaires, constantes et helpers
└── features/create   → Feature "create" (composants, store, services IA…)
```

Les alias TypeScript (`@jardin-iris/...`, `@env`) sont définis dans `tsconfig.base.json`.

## Génération et scaffolding

Utiliser les générateurs Nx :

```bash
npx nx g @nx/angular:component my-widget --project=shared-ui
npx nx g @nx/angular:library feature/new-feature --directory=features --standalone
```

## Développement

```bash
npm install
npm run start
```

Le serveur est disponible sur `http://localhost:4200/`.

## Tests & qualité

```bash
npm run lint
npm run test-single
```

Chaque bibliothèque dispose de son propre `project.json`; la configuration Nx permet d’exécuter uniquement ce qui est impacté (`affected:*`).

## Documentation Nx

Consulter [Nx.dev](https://nx.dev) pour les bonnes pratiques, la configuration des plugins Angular et l’intégration CI/CD.
