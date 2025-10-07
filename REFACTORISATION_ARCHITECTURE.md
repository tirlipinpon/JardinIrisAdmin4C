# 🏗️ Plan de Refactorisation - Architecture Application Article

**Date** : 6 octobre 2025  
**Objectif** : Refactoriser le flux Application → Store → Infrastructure pour améliorer la maintenabilité, testabilité et performance

---

## 📊 Architecture Actuelle - Analyse

### Flux actuel

```
CreateComponent
    ↓
Application.ts (effect() qui observe le store)
    ↓
Store (index.ts) avec rxMethod qui appellent Infrastructure
    ↓
Infrastructure.ts (600 lignes) qui injecte 10+ services
    ↓
Services API (OpenAI, YouTube, Pexels, Supabase, etc.)
```

### ⚠️ Problèmes identifiés

1. **Couplage fort**

   - Le Store injecte directement `Infrastructure` et `InfrastructurePerformanceService`
   - Impossible de tester le Store sans mocker l'Infrastructure
   - Changement dans Infrastructure = impact sur Store = impact sur Application

2. **Responsabilité floue**

   - `Application.ts` : Orchestre via un `effect()` qui observe les changements du store
   - `Store` : Gère l'état + orchestration + appels API
   - `Infrastructure.ts` : Gère les appels API + gestion d'erreur + mocks + logging

3. **Infrastructure surchargée**

   - 600 lignes dans un seul fichier
   - Injecte 10+ services différents
   - Méthodes de test, mocks, gestion d'erreur tout mélangé
   - Single Responsibility Principle violé

4. **Duplication et confusion**

   - `Infrastructure.ts` ET `InfrastructurePerformanceService.ts` coexistent
   - Pas clair quelle couche appeler et pourquoi

5. **Gestion d'erreur répétitive**

   - Chaque méthode a le même pattern `wrapWithErrorHandling`
   - Mock flags répétés partout (`shouldReturnMock`, `shouldReturnError`)
   - Transformation d'erreurs dupliquée

6. **Tests difficiles**

   - Couplage fort = mocking complexe
   - `effect()` difficile à tester de manière isolée
   - Dépendances transitives (Store → Infra → 10 services)

7. **Orchestration réactive fragile**

   - Les `effect()` déclenchent des actions basées sur `step`
   - Risque de boucles infinies si mal géré
   - Difficile de déboguer le flux
   - Double-appels possibles avec les guards `runningMethods`

8. **Performance non optimale**
   - Appels séquentiels alors qu'ils pourraient être parallèles :
     ```typescript
     // Dans Application.ts effect() - Step 1
     this.store.setVideo(); // Attend la fin
     this.store.setFaq(); // Attend la fin
     this.store.internalImage(); // Attend la fin
     this.store.setImageUrl(); // Attend la fin
     ```
   - Ces 4 opérations sont indépendantes et pourraient s'exécuter en parallèle

---

## 🎯 Architecture Proposée - Clean Architecture + SOLID

### Principe directeur : Séparation des responsabilités en couches

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (UI)                                         │
│  Responsabilité : Affichage, événements utilisateur             │
│                                                                  │
│  - CreateComponent                                              │
│  - ArticleEditorComponent                                       │
│  - FaqComponent, QcmComponent, etc.                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Appelle
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (Use Cases / Facades)                         │
│  Responsabilité : Orchestration du workflow métier              │
│                   PAS de logique métier, juste coordination     │
│                                                                  │
│  - ArticleGenerationFacade                                      │
│      → generateFullArticle(idea: string)                        │
│      → step1_CreateArticle()                                    │
│      → step2_EnrichWithMedia()                                  │
│      → step3_AddInternalLinks()                                 │
│      → step4_EnrichWithBotanicalInfo()                          │
│                                                                  │
│  - ArticleEnrichmentFacade                                      │
│  - ArticleSaveFacade                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Utilise
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER (Logique Métier)                                  │
│  Responsabilité : État + Règles métier + Transformations        │
│                                                                  │
│  Store (État pur - pas d'appels API)                            │
│  - ArticleStore                                                 │
│      → Signals pour l'état réactif                              │
│      → Méthodes simples de mise à jour                          │
│                                                                  │
│  Services Métier (Logique pure)                                 │
│  - ArticleGenerationService                                     │
│      → buildContext(titles, weather)                            │
│      → validateArticle(article)                                 │
│      → enrichArticleWithMetadata(article)                       │
│                                                                  │
│  - ArticleEnrichmentService                                     │
│      → addInternalLinks(article, existingPosts)                 │
│      → enrichWithBotanicalNames(article)                        │
│                                                                  │
│  - ArticleValidationService                                     │
│      → validateBeforeSave(article)                              │
│      → checkSEORequirements(article)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Utilise (via Interfaces)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER (Adapters vers le monde extérieur)        │
│  Responsabilité : Communication avec APIs, DB, services externes│
│                                                                  │
│  Repositories (Interfaces + Implémentations)                    │
│  - IArticleRepository (interface)                               │
│    └── SupabaseArticleRepository (implémentation)              │
│        → save(), update(), getById(), getLastTitles()           │
│                                                                  │
│  - IFaqRepository (interface)                                   │
│    └── SupabaseFaqRepository                                   │
│                                                                  │
│  Providers (Interfaces + Implémentations)                       │
│  - IAIProvider (interface)                                      │
│    └── OpenAIAdapter (implémentation)                           │
│    └── PerplexityAdapter (implémentation)                       │
│    └── DeepSeekAdapter (implémentation)                         │
│                                                                  │
│  - IMediaProvider (interface)                                   │
│    └── YouTubeAdapter                                           │
│    └── PexelsAdapter                                            │
│    └── DallEAdapter                                             │
│                                                                  │
│  - IBotanicalProvider (interface)                               │
│    └── INaturalistAdapter                                       │
│                                                                  │
│  - IWeatherProvider (interface)                                 │
│    └── OpenMeteoAdapter                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Flux de données proposé

```
User Action (Créer Article)
    ↓
CreateComponent.onGenerate()
    ↓
ArticleGenerationFacade.generateFullArticle(idea)
    ↓
    ├─→ ArticleStore.startGeneration()              [Update UI state]
    │
    ├─→ Step 1: ArticleGenerationService
    │       ├─→ ArticleRepository.getLastTitles()
    │       ├─→ WeatherProvider.getCurrent()
    │       ├─→ AIProvider.generate(idea, context)
    │       └─→ ArticleStore.setArticle(result)
    │
    ├─→ Step 2: EnrichWithMedia (PARALLEL avec forkJoin)
    │       ├─→ MediaProvider.findVideo()       ┐
    │       ├─→ MediaProvider.generateImage()   │ EN PARALLÈLE
    │       ├─→ AIProvider.generateFaq()        │ = 4x plus rapide
    │       └─→ ImageService.findInternal()     ┘
    │       └─→ ArticleStore.updateMedia(results)
    │
    ├─→ Step 3: ArticleEnrichmentService
    │       ├─→ addInternalLinks()
    │       └─→ ArticleStore.updateArticle(enriched)
    │
    ├─→ Step 4: ArticleEnrichmentService
    │       ├─→ enrichWithBotanicalNames()
    │       └─→ ArticleStore.updateArticle(final)
    │
    └─→ ArticleStore.completeGeneration()           [Update UI state]
```

---

## 🔧 Refactorisation Détaillée par Composant

### 1. Supprimer `Application.ts` avec son `effect()`

#### ❌ Problème actuel

```typescript
// Application.ts - À SUPPRIMER
constructor() {
  effect(() => {
    const step = this.store.step();
    const postId = this.store.postId();
    const article = this.store.article();

    // Logique d'orchestration basée sur les changements d'état
    if (step === 1 && typeof postId === 'number' && article) {
      this.store.setVideo();    // Appel réactif
      this.store.setFaq();       // Difficile à contrôler
      this.store.internalImage();
      this.store.setImageUrl();
    }
    // Risque de boucles, difficile à déboguer
  });
}
```

**Problèmes** :

- Les `effect()` sont difficiles à déboguer
- Peuvent causer des boucles infinies
- Testabilité limitée
- Flux implicite et caché

#### ✅ Solution proposée : Facade avec orchestration impérative

```typescript
// article-generation.facade.ts
@Injectable({ providedIn: "root" })
export class ArticleGenerationFacade {
  private readonly articleStore = inject(ArticleStore);
  private readonly articleService = inject(ArticleGenerationService);
  private readonly enrichmentService = inject(ArticleEnrichmentService);
  private readonly loggingService = inject(LoggingService);

  /**
   * Méthode principale qui orchestre TOUT le workflow
   * Flux explicite, testable, avec gestion d'erreur centralisée
   */
  generateFullArticle(idea: string): Observable<ArticleResult> {
    this.articleStore.startGeneration();
    this.loggingService.info("FACADE", "Début génération article", { idea });

    return this.step1_CreateArticle(idea).pipe(
      tap((article) => this.articleStore.setArticle(article)),

      switchMap((article) => this.step2_EnrichWithMedia(article)),
      tap((article) => this.articleStore.updateMedia(article)),

      switchMap((article) => this.step3_AddInternalLinks(article)),
      tap((article) => this.articleStore.updateArticle(article)),

      switchMap((article) => this.step4_EnrichWithBotanicalInfo(article)),
      tap((article) => {
        this.articleStore.updateArticle(article);
        this.articleStore.completeGeneration();
      }),

      catchError((error) => {
        this.articleStore.addError(error);
        this.articleStore.stopGeneration();
        return throwError(() => error);
      })
    );
  }

  /**
   * Étape 1 : Création de l'article avec contexte
   */
  private step1_CreateArticle(idea: string): Observable<Article> {
    this.loggingService.info("FACADE", "Step 1: Création article");

    return forkJoin({
      postId: this.articleRepository.getNextPostId(),
      lastTitles: this.articleRepository.getLastTitles(10),
      weather: this.weatherProvider.getCurrent(),
    }).pipe(switchMap((context) => this.articleService.generateArticleWithContext(idea, context)));
  }

  /**
   * Étape 2 : Enrichissement média (TOUT EN PARALLÈLE)
   */
  private step2_EnrichWithMedia(article: Article): Observable<Article> {
    this.loggingService.info("FACADE", "Step 2: Enrichissement média");

    return forkJoin({
      video: this.mediaProvider.findVideo(article.titre),
      image: this.mediaProvider.generateImage(article.phrase_accroche),
      faq: this.aiProvider.generateFaq(article.article),
      internalImages: this.imageService.findInternalImages(article),
    }).pipe(
      map((results) => ({
        ...article,
        video: results.video,
        image_url: results.image,
        faq: results.faq,
        internalImages: results.internalImages,
      }))
    );
  }

  /**
   * Étape 3 : Ajout de liens internes
   */
  private step3_AddInternalLinks(article: Article): Observable<Article> {
    this.loggingService.info("FACADE", "Step 3: Liens internes");

    return this.articleRepository.getLastTitles(10).pipe(switchMap((existingPosts) => this.enrichmentService.addInternalLinks(article, existingPosts)));
  }

  /**
   * Étape 4 : Enrichissement botanique
   */
  private step4_EnrichWithBotanicalInfo(article: Article): Observable<Article> {
    this.loggingService.info("FACADE", "Step 4: Enrichissement botanique");

    return this.enrichmentService.enrichWithBotanicalNames(article);
  }
}
```

**Avantages** :

- ✅ Flux explicite et linéaire
- ✅ Facile à tester (mock des dépendances)
- ✅ Pas de dépendance aux changements d'état
- ✅ Retry, timeout, cache faciles à ajouter
- ✅ Traçabilité complète du workflow
- ✅ Performance optimale avec `forkJoin`

---

### 2. Séparer le Store en responsabilités claires

#### ❌ Problème actuel

```typescript
// index.ts - Store actuel (647 lignes)
export const SearchStore = signalStore(
  withState(initialValue),
  withMethods((store, infra = inject(Infrastructure)) => ({
    // PROBLÈME 1: Appels API dans le Store
    setPost: rxMethod<string>(
      pipe(
        concatMap((articleIdea: string) =>
          infraPerf.setPost(articleIdea).pipe(...)
        )
      )
    ),

    // PROBLÈME 2: Orchestration dans le Store
    setVideo: rxMethod<void>(...),
    setFaq: rxMethod<void>(...),

    // PROBLÈME 3: Validation mélangée avec les appels
    // PROBLÈME 4: Gestion d'erreur dupliquée partout
  }))
);
```

**Problèmes** :

- Store fait trop de choses (État + API + Orchestration + Validation)
- Injection de `Infrastructure` crée un couplage fort
- rxMethod avec concatMap = logique complexe dans le Store
- Tests difficiles (doit mocker Infrastructure)

#### ✅ Solution proposée : Store PUR pour l'état uniquement

```typescript
// domain/store/article.store.ts
export interface ArticleState {
  // État de génération
  step: WorkflowStep;
  isGenerating: boolean;

  // Données de l'article
  postId: number | null;
  article: Article | null;

  // Données enrichies
  video: string | null;
  image_url: string | null;
  faq: FaqItem[];
  internalImages: InternalImageData[];

  // Titres existants pour liens internes
  existingPosts: PostTitleAndId[];

  // Gestion d'erreur
  errors: string[];
}

const initialState: ArticleState = {
  step: WorkflowStep.IDLE,
  isGenerating: false,
  postId: null,
  article: null,
  video: null,
  image_url: null,
  faq: [],
  internalImages: [],
  existingPosts: [],
  errors: [],
};

export const ArticleStore = signalStore(
  { providedIn: "root" },
  withDevtools("article"),
  withState(initialState),

  // Computed signals pour dérivation d'état
  withComputed((state) => ({
    hasArticle: computed(() => !!state.article()),
    canSave: computed(() => state.step() === WorkflowStep.COMPLETED && state.article() !== null),
    hasErrors: computed(() => state.errors().length > 0),
  })),

  // Méthodes SIMPLES de mise à jour d'état
  // PAS d'appels API, PAS de rxMethod complexes
  withMethods((store) => ({
    // Gestion du workflow
    startGeneration: () => {
      patchState(store, {
        isGenerating: true,
        step: WorkflowStep.GENERATING,
        errors: [],
      });
    },

    completeGeneration: () => {
      patchState(store, {
        isGenerating: false,
        step: WorkflowStep.COMPLETED,
      });
    },

    stopGeneration: () => {
      patchState(store, { isGenerating: false });
    },

    nextStep: (step: WorkflowStep) => {
      patchState(store, { step });
    },

    // Mise à jour des données
    setPostId: (postId: number) => {
      patchState(store, { postId });
    },

    setArticle: (article: Article) => {
      patchState(store, { article });
    },

    updateMedia: (media: { video: string; image_url: string; faq: FaqItem[]; internalImages: InternalImageData[] }) => {
      patchState(store, media);
    },

    updateArticle: (article: Article) => {
      patchState(store, { article });
    },

    setExistingPosts: (posts: PostTitleAndId[]) => {
      patchState(store, { existingPosts: posts });
    },

    // Gestion des erreurs
    addError: (error: string) => {
      const currentErrors = store.errors();
      patchState(store, { errors: [...currentErrors, error] });
    },

    clearErrors: () => {
      patchState(store, { errors: [] });
    },

    // Gestion FAQ
    updateFaqItem: (index: number, item: FaqItem) => {
      const faq = [...store.faq()];
      faq[index] = item;
      patchState(store, { faq });
    },

    addFaqItem: (item: FaqItem) => {
      const faq = [...store.faq(), item];
      patchState(store, { faq });
    },

    deleteFaqItem: (index: number) => {
      const faq = store.faq().filter((_, i) => i !== index);
      patchState(store, { faq });
    },

    // Reset
    reset: () => {
      patchState(store, initialState);
    },
  }))
);
```

**Avantages** :

- ✅ Store = UNIQUEMENT l'état
- ✅ Aucune dépendance externe
- ✅ Tests ultra-simples (pas de mocks)
- ✅ Computed signals pour performances
- ✅ Immutabilité garantie
- ✅ Type-safe avec TypeScript

---

### 3. Refactoriser Infrastructure en Repository Pattern

#### ❌ Problème actuel

```typescript
// infrastructure.ts (600 lignes)
@Injectable({ providedIn: 'root' })
export class Infrastructure {
  // PROBLÈME 1: Injection de 10+ services
  private readonly supabaseService = inject(SupabaseService);
  private readonly openaiApiService = inject(OpenaiApiService);
  private readonly googleSearchService = inject(GoogleSearchService);
  private readonly pexelsApiService = inject(PexelsApiService);
  private readonly addScientificNameService = inject(AddScientificNameService);
  private readonly internalImageService = inject(InternalImageService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly videoService = inject(VideoService);
  private readonly vegetalService = inject(VegetalService);

  // PROBLÈME 2: Méthodes de test mélangées avec production
  testError(): Observable<string | PostgrestError> { ... }
  testSupabaseStorageError(): Observable<string | PostgrestError> { ... }

  // PROBLÈME 3: Chaque méthode gère mock + erreur + appel réel
  setPost(articleIdea: string): Observable<Post | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = this.isLocalhost();

    if (shouldReturnError) { return mockError; }
    if (shouldReturnMock) { return mockData; }

    // Code réel
  }

  // ... 15 autres méthodes avec le même pattern répétitif
}
```

**Problèmes** :

- Violation du Single Responsibility Principle
- Impossible de remplacer une seule dépendance
- Tests difficiles (doit mocker 10 services)
- Code répétitif (mock/error pattern partout)
- 600 lignes = non maintenable

#### ✅ Solution proposée : Interfaces + Implémentations séparées

##### 3.1 Définir les interfaces (Ports)

```typescript
// infrastructure/repositories/article.repository.interface.ts
export interface IArticleRepository {
  getNextPostId(): Observable<number>;
  getLastTitles(limit: number): Observable<PostTitleAndId[]>;
  save(article: Article): Observable<void>;
  update(id: number, article: Partial<Article>): Observable<void>;
  getById(id: number): Observable<Article | null>;
}

// infrastructure/repositories/faq.repository.interface.ts
export interface IFaqRepository {
  saveForPost(postId: number, items: FaqItem[]): Observable<void>;
  getByPostId(postId: number): Observable<FaqItem[]>;
  deleteByPostId(postId: number): Observable<void>;
}

// infrastructure/repositories/image.repository.interface.ts
export interface IImageRepository {
  saveInternalImages(postId: number, images: InternalImageData[]): Observable<void>;
  getByPostId(postId: number): Observable<InternalImageData[]>;
}

// infrastructure/providers/ai-provider.interface.ts
export interface IAIProvider {
  generateArticle(prompt: string, context: ArticleContext): Observable<Article>;
  generateFaq(article: string): Observable<FaqItem[]>;
  generateKeywords(chapter: string): Observable<string[]>;
}

// infrastructure/providers/media-provider.interface.ts
export interface IMediaProvider {
  findVideo(query: string): Observable<string>;
  generateImage(prompt: string): Observable<string>;
  uploadImage(imageUrl: string, postId: number): Observable<string>;
  searchImages(keywords: string[]): Observable<string[]>;
}

// infrastructure/providers/botanical-provider.interface.ts
export interface IBotanicalProvider {
  enrichWithScientificNames(article: string): Observable<string>;
  searchTaxon(plantName: string): Observable<TaxonInfo | null>;
}

// infrastructure/providers/weather-provider.interface.ts
export interface IWeatherProvider {
  getCurrent(): Observable<WeatherInfo>;
}
```

##### 3.2 Implémenter les adapters (Adapters)

```typescript
// infrastructure/repositories/supabase-article.repository.ts
@Injectable({ providedIn: "root" })
export class SupabaseArticleRepository implements IArticleRepository {
  private readonly supabase = inject(SupabaseService);
  private readonly logger = inject(LoggingService);

  getNextPostId(): Observable<number> {
    return from(this.supabase.getNextPostId()).pipe(tap((id) => this.logger.info("REPO", "Next post ID", { id })));
  }

  getLastTitles(limit: number): Observable<PostTitleAndId[]> {
    return from(this.supabase.getLastPostTitreAndId(limit));
  }

  save(article: Article): Observable<void> {
    return from(this.supabase.updatePostComplete(article)).pipe(map(() => void 0));
  }

  // ... autres méthodes
}

// infrastructure/providers/openai.adapter.ts
@Injectable({ providedIn: "root" })
export class OpenAIAdapter implements IAIProvider {
  private readonly api = inject(OpenaiApiService);
  private readonly prompts = inject(GetPromptsService);

  generateArticle(idea: string, context: ArticleContext): Observable<Article> {
    const prompt = this.prompts.generateArticle(idea, context);
    return from(this.api.fetchData(prompt, true, "generateArticle")).pipe(map((result) => parseJsonSafe(extractJSONBlock(result))));
  }

  generateFaq(article: string): Observable<FaqItem[]> {
    const prompt = this.prompts.getPromptFaq(article);
    return from(this.api.fetchData(prompt, true, "generateFaq")).pipe(map((result) => JSON.parse(extractJSONBlock(result))));
  }

  // ... autres méthodes
}

// infrastructure/providers/youtube.adapter.ts
@Injectable({ providedIn: "root" })
export class YouTubeAdapter implements IMediaProvider {
  private readonly videoService = inject(VideoService);

  findVideo(query: string): Observable<string> {
    return this.videoService.findBestVideoUrl(query, false);
  }

  // ... autres méthodes média
}

// infrastructure/providers/pexels.adapter.ts
@Injectable({ providedIn: "root" })
export class PexelsAdapter implements IMediaProvider {
  private readonly pexelsApi = inject(PexelsApiService);

  searchImages(keywords: string[]): Observable<string[]> {
    // Implémentation spécifique Pexels
  }

  // ... autres méthodes
}

// infrastructure/providers/inaturalist.adapter.ts
@Injectable({ providedIn: "root" })
export class INaturalistAdapter implements IBotanicalProvider {
  private readonly vegetalService = inject(VegetalService);

  enrichWithScientificNames(article: string): Observable<string> {
    return this.vegetalService.enrichArticleWithBotanicalNames(article, false);
  }

  searchTaxon(plantName: string): Observable<TaxonInfo | null> {
    // Appel API iNaturalist
  }
}
```

##### 3.3 Provider pour l'injection

```typescript
// infrastructure/providers/infrastructure.providers.ts
export const ARTICLE_REPOSITORY = new InjectionToken<IArticleRepository>("ArticleRepository");
export const FAQ_REPOSITORY = new InjectionToken<IFaqRepository>("FaqRepository");
export const AI_PROVIDER = new InjectionToken<IAIProvider>("AIProvider");
export const MEDIA_PROVIDER = new InjectionToken<IMediaProvider>("MediaProvider");
export const BOTANICAL_PROVIDER = new InjectionToken<IBotanicalProvider>("BotanicalProvider");
export const WEATHER_PROVIDER = new InjectionToken<IWeatherProvider>("WeatherProvider");

export const INFRASTRUCTURE_PROVIDERS: Provider[] = [
  // Repositories
  { provide: ARTICLE_REPOSITORY, useClass: SupabaseArticleRepository },
  { provide: FAQ_REPOSITORY, useClass: SupabaseFaqRepository },
  { provide: IMAGE_REPOSITORY, useClass: SupabaseImageRepository },

  // Providers
  { provide: AI_PROVIDER, useClass: OpenAIAdapter },
  { provide: MEDIA_PROVIDER, useClass: YouTubeAdapter }, // Ou composite de plusieurs
  { provide: BOTANICAL_PROVIDER, useClass: INaturalistAdapter },
  { provide: WEATHER_PROVIDER, useClass: OpenMeteoAdapter },
];

// Dans app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ... autres providers
    ...INFRASTRUCTURE_PROVIDERS,
  ],
};
```

**Avantages** :

- ✅ Chaque adapter < 150 lignes
- ✅ Facile à tester (mock de l'interface)
- ✅ Facile à remplacer (ex: OpenAI → Claude)
- ✅ Respect du Dependency Inversion Principle
- ✅ Possibilité de créer des adapters composites
- ✅ Mock/Prod séparés (pas de if/else dans le code)

---

### 4. Créer des Services de Domaine

#### Services métier avec logique pure

```typescript
// domain/services/article-generation.service.ts
@Injectable({ providedIn: "root" })
export class ArticleGenerationService {
  private readonly articleRepo = inject(ARTICLE_REPOSITORY);
  private readonly aiProvider = inject(AI_PROVIDER);
  private readonly weatherProvider = inject(WEATHER_PROVIDER);
  private readonly logger = inject(LoggingService);

  /**
   * Génère un article avec tout le contexte nécessaire
   * LOGIQUE MÉTIER PURE - pas d'appel direct à Supabase/OpenAI
   */
  async generateArticleWithContext(idea: string, context: { postId: number; lastTitles: string[]; weather: WeatherInfo }): Promise<Article> {
    this.logger.info("DOMAIN", "Génération article avec contexte", { idea });

    // 1. Construire le contexte enrichi
    const enrichedContext: ArticleContext = {
      idea,
      postId: context.postId,
      existingTitles: context.lastTitles,
      weather: this.formatWeatherForArticle(context.weather),
      date: new Date(),
    };

    // 2. Générer l'article via le provider AI
    const article = await firstValueFrom(this.aiProvider.generateArticle(idea, enrichedContext));

    // 3. Valider l'article généré
    this.validateArticleStructure(article);

    // 4. Enrichir avec métadonnées
    return this.enrichArticleWithMetadata(article, enrichedContext);
  }

  /**
   * Validation de la structure de l'article
   */
  private validateArticleStructure(article: Article): void {
    const errors: string[] = [];

    if (!article.titre || article.titre.length < 10) {
      errors.push("Titre trop court (minimum 10 caractères)");
    }

    if (!article.article || article.article.length < 500) {
      errors.push("Article trop court (minimum 500 caractères)");
    }

    if (!article.phrase_accroche || article.phrase_accroche.length < 50) {
      errors.push("Phrase d'accroche trop courte");
    }

    // Vérifier la structure HTML
    const paragraphCount = (article.article.match(/<span id='paragraphe-\d+'>/g) || []).length;
    if (paragraphCount < 5) {
      errors.push(`Nombre de paragraphes insuffisant (${paragraphCount}/5 minimum)`);
    }

    if (errors.length > 0) {
      throw new ArticleValidationError("Article invalide", errors);
    }
  }

  /**
   * Formater la météo pour inclusion dans l'article
   */
  private formatWeatherForArticle(weather: WeatherInfo): string {
    return `Aujourd'hui, ${weather.description} avec des températures de ${weather.temperature}°C, ${weather.gardenActivity}.`;
  }

  /**
   * Enrichir l'article avec des métadonnées calculées
   */
  private enrichArticleWithMetadata(article: Article, context: ArticleContext): Article {
    return {
      ...article,
      description_meteo: context.weather,
      created_at: context.date.toISOString(),
      // Générer un slug SEO-friendly
      new_href: this.generateSeoSlug(article.titre),
      // Extraire les mots-clés pour SEO
      keywords: this.extractKeywords(article.article),
    };
  }

  /**
   * Générer un slug SEO-friendly
   */
  private generateSeoSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Extraire les mots-clés principaux de l'article
   */
  private extractKeywords(article: string): string[] {
    // Logique d'extraction de mots-clés
    // (Peut utiliser l'AI provider si nécessaire)
    return [];
  }
}

// domain/services/article-enrichment.service.ts
@Injectable({ providedIn: "root" })
export class ArticleEnrichmentService {
  private readonly aiProvider = inject(AI_PROVIDER);
  private readonly botanicalProvider = inject(BOTANICAL_PROVIDER);
  private readonly logger = inject(LoggingService);

  /**
   * Ajoute des liens internes vers d'autres articles
   */
  addInternalLinks(article: Article, existingPosts: PostTitleAndId[]): Observable<Article> {
    this.logger.info("DOMAIN", "Ajout de liens internes", {
      articleLength: article.article.length,
      postsCount: existingPosts.length,
    });

    // Déléguer au provider AI pour identifier les opportunités de liens
    return this.aiProvider.addInternalLinks(article.article, existingPosts).pipe(
      map((upgradedArticle) => ({
        ...article,
        article: upgradedArticle,
      }))
    );
  }

  /**
   * Enrichit l'article avec les noms scientifiques des plantes
   */
  enrichWithBotanicalNames(article: Article): Observable<Article> {
    this.logger.info("DOMAIN", "Enrichissement botanique");

    return this.botanicalProvider.enrichWithScientificNames(article.article).pipe(
      map((enrichedArticle) => ({
        ...article,
        article: enrichedArticle,
      }))
    );
  }
}

// domain/services/article-validation.service.ts
@Injectable({ providedIn: "root" })
export class ArticleValidationService {
  /**
   * Valide qu'un article est prêt pour la sauvegarde
   */
  validateBeforeSave(article: Article): ValidationResult {
    const errors: string[] = [];

    // Vérifications obligatoires
    if (!article.titre) errors.push("Titre manquant");
    if (!article.article) errors.push("Contenu manquant");
    if (!article.phrase_accroche) errors.push("Phrase d'accroche manquante");
    if (!article.categorie) errors.push("Catégorie manquante");
    if (!article.new_href) errors.push("URL manquante");

    // Vérifications SEO
    const seoErrors = this.checkSEORequirements(article);
    errors.push(...seoErrors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Vérifie les exigences SEO
   */
  checkSEORequirements(article: Article): string[] {
    const errors: string[] = [];

    // Longueur titre
    if (article.titre.length > 60) {
      errors.push("Titre trop long pour SEO (> 60 caractères)");
    }

    // Longueur phrase d'accroche (meta description)
    if (article.phrase_accroche && article.phrase_accroche.length > 160) {
      errors.push("Phrase d'accroche trop longue pour meta description (> 160 caractères)");
    }

    // Présence d'images
    if (!article.image_url) {
      errors.push("Image principale manquante (important pour SEO)");
    }

    // Structure HTML
    const hasH4 = article.article.includes("<h4>");
    if (!hasH4) {
      errors.push("Aucun sous-titre H4 détecté (structure SEO)");
    }

    return errors;
  }
}
```

**Avantages** :

- ✅ Logique métier centralisée et réutilisable
- ✅ Tests unitaires faciles (pas d'async complexe)
- ✅ Pas de dépendance directe aux APIs externes
- ✅ Code explicite et documenté

---

### 5. ~~Optimiser les appels parallèles~~ ✅ **IMPLÉMENTÉ**

> ✅ **Cette section a été implémentée avec succès !**  
> Voir le fichier `OPTIMISATIONS_REALISEES.md` pour les détails complets.
>
> **Résumé** :
>
> - Méthode `enrichMediaParallel()` créée dans le Store
> - Utilisation de `forkJoin` pour exécuter 4 tâches en parallèle
> - **Gain : 50-60% de temps économisé** (26-37 sec → 10-15 sec)

---

### 6. ~~Simplifier la gestion d'erreur~~ ✅ **IMPLÉMENTÉ**

> ✅ **Cette section a été implémentée avec succès !**  
> Voir le fichier `OPTIMISATIONS_REALISEES.md` pour les détails complets.
>
> **Résumé** :
>
> - Classes d'erreur standardisées créées (`AppError`, `AIProviderError`, etc.)
> - `ErrorHandlerService` centralisé avec retry automatique
> - `MockDataService` pour centraliser tous les mocks
> - Compatible avec tous les SDKs (OpenAI, Supabase, etc.)

---

### 7. State Machine pour les étapes

#### ❌ Actuellement : step: number avec conditions

```typescript
// Dans Application.ts
if (step === 1 && typeof postId === 'number' && article) { ... }
else if (step === 2 && article && postTitreAndId.length > 0) { ... }
else if (step === 3 && article) { ... }
// Conditions complexes, facile de se tromper
```

#### ✅ Solution : Enum + State Machine

```typescript
// domain/models/workflow-state.enum.ts
export enum WorkflowStep {
  IDLE = "idle",
  FETCHING_CONTEXT = "fetching_context",
  GENERATING_ARTICLE = "generating_article",
  ENRICHING_MEDIA = "enriching_media",
  ADDING_INTERNAL_LINKS = "adding_internal_links",
  ENRICHING_BOTANICAL = "enriching_botanical",
  COMPLETED = "completed",
  ERROR = "error",
}

// domain/services/article-workflow.state-machine.ts
@Injectable({ providedIn: "root" })
export class ArticleWorkflowStateMachine {
  private readonly store = inject(ArticleStore);
  private readonly logger = inject(LoggingService);

  /**
   * Définition des transitions autorisées
   */
  private readonly transitions: Record<WorkflowStep, WorkflowStep[]> = {
    [WorkflowStep.IDLE]: [WorkflowStep.FETCHING_CONTEXT],
    [WorkflowStep.FETCHING_CONTEXT]: [WorkflowStep.GENERATING_ARTICLE, WorkflowStep.ERROR],
    [WorkflowStep.GENERATING_ARTICLE]: [WorkflowStep.ENRICHING_MEDIA, WorkflowStep.ERROR],
    [WorkflowStep.ENRICHING_MEDIA]: [WorkflowStep.ADDING_INTERNAL_LINKS, WorkflowStep.ERROR],
    [WorkflowStep.ADDING_INTERNAL_LINKS]: [WorkflowStep.ENRICHING_BOTANICAL, WorkflowStep.ERROR],
    [WorkflowStep.ENRICHING_BOTANICAL]: [WorkflowStep.COMPLETED, WorkflowStep.ERROR],
    [WorkflowStep.COMPLETED]: [WorkflowStep.IDLE], // Reset pour nouvelle génération
    [WorkflowStep.ERROR]: [WorkflowStep.IDLE],
  };

  /**
   * Vérifie si une transition est autorisée
   */
  canTransitionTo(nextStep: WorkflowStep): boolean {
    const currentStep = this.store.step();
    const allowedSteps = this.transitions[currentStep] || [];
    return allowedSteps.includes(nextStep);
  }

  /**
   * Effectue une transition si autorisée
   */
  transitionTo(nextStep: WorkflowStep): void {
    if (!this.canTransitionTo(nextStep)) {
      const error = `Transition interdite: ${this.store.step()} → ${nextStep}`;
      this.logger.error("STATE_MACHINE", error);
      throw new IllegalStateTransitionError(error);
    }

    this.logger.info("STATE_MACHINE", `Transition: ${this.store.step()} → ${nextStep}`);
    this.store.nextStep(nextStep);
  }

  /**
   * Retourne les étapes suivantes possibles
   */
  getNextPossibleSteps(): WorkflowStep[] {
    return this.transitions[this.store.step()] || [];
  }

  /**
   * Vérifie si le workflow est terminé
   */
  isCompleted(): boolean {
    return this.store.step() === WorkflowStep.COMPLETED;
  }

  /**
   * Vérifie si le workflow est en erreur
   */
  hasError(): boolean {
    return this.store.step() === WorkflowStep.ERROR;
  }

  /**
   * Reset le workflow
   */
  reset(): void {
    this.transitionTo(WorkflowStep.IDLE);
  }
}

// Utilisation dans la Facade
export class ArticleGenerationFacade {
  private readonly stateMachine = inject(ArticleWorkflowStateMachine);

  generateFullArticle(idea: string): Observable<ArticleResult> {
    // Vérifier qu'on peut démarrer
    if (!this.stateMachine.canTransitionTo(WorkflowStep.FETCHING_CONTEXT)) {
      throw new Error("Génération déjà en cours");
    }

    return this.step1_FetchContext(idea).pipe(
      tap(() => this.stateMachine.transitionTo(WorkflowStep.GENERATING_ARTICLE)),
      switchMap(() => this.step2_GenerateArticle()),
      tap(() => this.stateMachine.transitionTo(WorkflowStep.ENRICHING_MEDIA))
      // etc.
    );
  }
}
```

**Avantages** :

- ✅ Transitions explicites et validées
- ✅ Impossible d'avoir des états incohérents
- ✅ Facile de visualiser le workflow
- ✅ Tests simples (vérifier les transitions)
- ✅ Traçabilité complète

---

## 🏗️ Structure de Fichiers Finale

```
src/app/features/create/
│
├── presentation/                          # UI Components (actuellement components/)
│   ├── create.component.ts                # Container component
│   ├── create.component.html
│   ├── create.component.css
│   │
│   ├── article-editor/                    # Éditeur d'article
│   │   ├── article-editor.component.ts
│   │   ├── article-editor.component.html
│   │   └── article-editor.component.css
│   │
│   ├── article-stats/                     # Statistiques
│   │   ├── article-stats.component.ts
│   │   ├── article-stats.component.html
│   │   └── article-stats.component.css
│   │
│   ├── faq/                              # Gestion FAQ
│   │   ├── faq.component.ts
│   │   ├── faq.component.html
│   │   └── faq.component.css
│   │
│   └── [autres composants UI...]
│
├── application/                           # Facades (orchestration)
│   ├── article-generation.facade.ts       # REMPLACE Application.ts
│   ├── article-enrichment.facade.ts       # Orchestration enrichissement
│   ├── article-save.facade.ts             # Orchestration sauvegarde
│   └── article-workflow.facade.ts         # Workflow complet
│
├── domain/                                # Logique métier + État
│   │
│   ├── store/                             # État centralisé (REMPLACE store/)
│   │   ├── article.store.ts               # Store simplifié (uniquement état)
│   │   └── article.selectors.ts           # Computed signals avancés
│   │
│   ├── services/                          # Services métier (logique pure)
│   │   ├── article-generation.service.ts  # Logique génération
│   │   ├── article-enrichment.service.ts  # Logique enrichissement
│   │   ├── article-validation.service.ts  # Validations métier
│   │   └── article-workflow.state-machine.ts  # Gestion des étapes
│   │
│   ├── models/                            # Modèles de domaine
│   │   ├── article.model.ts               # Interface Article enrichie
│   │   ├── faq.model.ts
│   │   ├── workflow-step.enum.ts
│   │   └── article-context.model.ts
│   │
│   └── errors/                            # Erreurs métier
│       ├── article-validation.error.ts
│       ├── illegal-state-transition.error.ts
│       └── generation.error.ts
│
├── infrastructure/                        # REMPLACE components/infrastructure/
│   │
│   ├── repositories/                      # Accès données (interfaces + implémentations)
│   │   ├── article.repository.interface.ts
│   │   ├── supabase-article.repository.ts
│   │   ├── faq.repository.interface.ts
│   │   ├── supabase-faq.repository.ts
│   │   ├── image.repository.interface.ts
│   │   └── supabase-image.repository.ts
│   │
│   ├── providers/                         # Providers externes (interfaces + adapters)
│   │   ├── ai/
│   │   │   ├── ai-provider.interface.ts
│   │   │   ├── openai.adapter.ts
│   │   │   ├── perplexity.adapter.ts
│   │   │   └── deepseek.adapter.ts
│   │   │
│   │   ├── media/
│   │   │   ├── media-provider.interface.ts
│   │   │   ├── youtube.adapter.ts
│   │   │   ├── pexels.adapter.ts
│   │   │   └── dalle.adapter.ts
│   │   │
│   │   ├── botanical/
│   │   │   ├── botanical-provider.interface.ts
│   │   │   └── inaturalist.adapter.ts
│   │   │
│   │   └── weather/
│   │       ├── weather-provider.interface.ts
│   │       └── openmeteo.adapter.ts
│   │
│   ├── interceptors/                      # HTTP Interceptors
│   │   ├── error-handling.interceptor.ts  # Gestion erreur centralisée
│   │   ├── mock.interceptor.ts            # Mocks centralisés (dev/test)
│   │   ├── logging.interceptor.ts         # Logging HTTP
│   │   └── retry.interceptor.ts           # Retry automatique
│   │
│   └── providers.ts                       # Injection tokens + providers config
│
├── services/                              # Services utilitaires (actuellement services/)
│   ├── openai-api/                        # Services API bas niveau (conservés)
│   ├── pexels-api/
│   ├── youtube-api/
│   └── [autres services API...]
│
├── utils/                                 # Utilitaires (conservés)
│   ├── cleanJsonObject.ts
│   ├── parseJson.ts
│   └── [autres utilitaires...]
│
└── types/                                 # Types génériques (conservés)
    ├── post.ts
    ├── faq.ts
    └── [autres types...]
```

---

## 📈 Bénéfices Mesurables de la Refactorisation

### 1. **Performance**

- ⚡ **50-60% de réduction du temps de génération** (étape 2 en parallèle)
- ⚡ **Moins de re-renders** (Store avec computed signals optimisés)
- ⚡ **Lazy loading** facilité (chaque couche indépendante)

### 2. **Maintenabilité**

- 📦 **Fichiers < 200 lignes** (vs 600 lignes actuellement)
- 📦 **Responsabilités claires** (1 fichier = 1 responsabilité)
- 📦 **Code auto-documenté** (interfaces explicites)

### 3. **Testabilité**

- ✅ **Tests unitaires simples** (pas de mocks complexes)
- ✅ **Tests d'intégration par couche**
- ✅ **Couverture de code > 80%** facilement atteignable

### 4. **Évolutivité**

- 🚀 **Ajout de nouvelles sources IA** en 10 minutes (nouveau adapter)
- 🚀 **Changement de provider** sans toucher au domaine
- 🚀 **Nouvelles features** sans casser l'existant

### 5. **Débogage**

- 🐛 **Flux explicite** (pas d'effet de bord caché)
- 🐛 **Logs structurés** par couche
- 🐛 **State Machine** = état toujours cohérent

### 6. **Qualité de code**

- 🏆 **Respect des principes SOLID**
- 🏆 **Clean Architecture** complète
- 🏆 **Type Safety** à 100%
- 🏆 **Best Practices Angular** suivies

---

## 🚀 Plan d'Implémentation (Ordre suggéré)

### Phase 1 : Fondations (1-2 jours)

1. ✅ Créer la structure de dossiers
2. ✅ Définir toutes les interfaces (repositories, providers)
3. ✅ Créer les modèles de domaine
4. ✅ Créer les enums et types

### Phase 2 : Infrastructure (2-3 jours)

1. ✅ Implémenter les repositories (Supabase)
2. ✅ Créer les adapters (OpenAI, YouTube, etc.)
3. ✅ Mettre en place les interceptors
4. ✅ Configurer l'injection de dépendances

### Phase 3 : Domaine (2-3 jours)

1. ✅ Refactoriser le Store (état pur)
2. ✅ Créer les services métier
3. ✅ Implémenter la State Machine
4. ✅ Ajouter les validations

### Phase 4 : Application (1-2 jours)

1. ✅ Créer les Facades
2. ✅ Implémenter le workflow complet
3. ✅ Optimiser avec forkJoin
4. ✅ Gestion d'erreur globale

### Phase 5 : Présentation (1 jour)

1. ✅ Adapter CreateComponent pour utiliser la Facade
2. ✅ Supprimer Application.ts (ancien effect)
3. ✅ Mettre à jour les autres composants UI

### Phase 6 : Tests & Cleanup (2 jours)

1. ✅ Tests unitaires des services
2. ✅ Tests d'intégration des facades
3. ✅ Tests E2E du workflow complet
4. ✅ Supprimer l'ancien code (Infrastructure.ts, etc.)

**Total estimé : 9-13 jours**

---

## 🎯 Comparaison Avant/Après

### Avant (Architecture actuelle)

```typescript
// CreateComponent appelle
Application.ts (effect observant le store)
    ↓ (couplage fort)
Store avec rxMethod
    ↓ (injection directe)
Infrastructure.ts (600 lignes, 10 services)
    ↓
Services API

❌ Problèmes :
- Couplage fort
- Tests difficiles
- Flux caché dans effect()
- Appels séquentiels
- Code répétitif (600 lignes)
- Pas de séparation domaine/infra
```

### Après (Architecture proposée)

```typescript
// CreateComponent appelle
ArticleGenerationFacade (orchestration claire)
    ↓ (utilise)
Domain Services (logique métier pure)
    ↓ (utilise via interfaces)
Repositories & Providers (adapters)
    ↓
Services API

✅ Avantages :
- Découplage total
- Tests faciles (mock d'interfaces)
- Flux explicite
- Appels parallèles (forkJoin)
- Fichiers < 200 lignes
- Clean Architecture complète
- Performance optimale
- Maintenabilité excellente
```

---

## 📚 Références et Patterns Utilisés

### Architecture

- **Clean Architecture** (Robert C. Martin) : Séparation en couches
- **Hexagonal Architecture** (Ports & Adapters)
- **Onion Architecture** : Domaine au centre

### Design Patterns

- **Repository Pattern** : Abstraction accès données
- **Adapter Pattern** : Conversion APIs externes
- **Facade Pattern** : Orchestration simplifiée
- **State Machine Pattern** : Gestion workflow
- **Strategy Pattern** : Providers interchangeables
- **Observer Pattern** : Signals Angular

### Principes SOLID

- **S**ingle Responsibility : 1 fichier = 1 responsabilité
- **O**pen/Closed : Extension sans modification
- **L**iskov Substitution : Interfaces respectées
- **I**nterface Segregation : Interfaces spécifiques
- **D**ependency Inversion : Dépend d'abstractions

### Angular Best Practices

- Standalone components
- Signals pour état réactif
- Computed signals pour dérivations
- inject() pour injection
- RxJS operators optimisés
- Type safety strict

---

## ⚠️ Points d'Attention lors de l'Implémentation

1. **Migration progressive**

   - Garder l'ancien code fonctionnel pendant la refacto
   - Feature flags pour basculer entre ancien/nouveau
   - Tests de non-régression

2. **Gestion des erreurs**

   - Ne pas tout casser en changeant la gestion d'erreur
   - Tester chaque adapter individuellement
   - Logger les erreurs de manière cohérente

3. **Performance**

   - Vérifier que forkJoin n'introduit pas de timeout
   - Surveiller la consommation mémoire
   - Utiliser des observables froids (pas de double-appels)

4. **Tests**

   - Commencer par tester les couches basses (repos, adapters)
   - Puis services métier
   - Puis facades
   - Enfin composants UI

5. **Documentation**
   - Documenter chaque interface
   - Expliquer les choix d'architecture
   - Maintenir ce document à jour

---

## 📝 Checklist de Refactorisation

### Avant de commencer

- [ ] Lire et comprendre toute l'architecture proposée
- [ ] Créer une branche Git dédiée
- [ ] S'assurer que tous les tests existants passent
- [ ] Préparer un plan de rollback

### Pendant l'implémentation

- [ ] Suivre l'ordre des phases
- [ ] Commiter après chaque fichier/module terminé
- [ ] Tester chaque couche indépendamment
- [ ] Maintenir la compatibilité avec l'ancien code

### Après la refactorisation

- [ ] Tous les tests passent
- [ ] Performance égale ou meilleure
- [ ] Pas de régression fonctionnelle
- [ ] Documentation mise à jour
- [ ] Code review effectuée
- [ ] Supprimer l'ancien code (Application.ts, Infrastructure.ts)

---

## 🎉 Conclusion

Cette refactorisation transforme une architecture monolithique en une **Clean Architecture** moderne, maintenable et performante.

**Gains principaux** :

- 🚀 **Performance** : 50-60% de gain sur la génération
- 🧪 **Testabilité** : Tests 10x plus faciles
- 🛠️ **Maintenabilité** : Code clair et modulaire
- 📈 **Évolutivité** : Ajout de features sans risque
- 🐛 **Débogage** : Flux explicite et traçable

**Investissement** : 9-13 jours de développement  
**ROI** : Immédiat et à long terme

---

**Document créé le** : 6 octobre 2025  
**Auteur** : Assistant IA - Expert Angular  
**Version** : 1.0  
**Status** : Prêt pour implémentation
