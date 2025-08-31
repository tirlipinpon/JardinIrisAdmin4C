import { signalStore, withState, withComputed, withMethods, patchState } from "@ngrx/signals";
import { updateState, withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { concatMap, finalize, map, Observable, of, pipe, tap, switchMap, toArray, catchError, from } from "rxjs";
import { Infrastructure } from "../component/infrastructure/infrastructure";
import { PostgrestError } from "@supabase/supabase-js";
import { LoggingService } from "../../../shared/services/logging.service";
import { InternalImageData } from "../types/internalImageData";
import { ValidationRule } from "../types/validationRule";

function throwOnError<T, E>(response: T | E, errorCheck: (val: any) => val is E): T {
  if (errorCheck(response)) {
    throw response;
  }
  return response;
}

const throwOnPostgrestError = <T>(response: T | PostgrestError): T => {
  if (response && typeof response === 'object' && 'message' in response && 'code' in response) {
    throw response;
  }
  return response as T;
};

const extractErrorMessage = (error: any): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as any).message;
  }
  return String(error);
};


const validateStoreValues = (
  store: any, 
  rules: ValidationRule[], 
  clearErrors: () => void, 
  addError: (message: string) => void
): string | null => {
  let hasError = false;
  let firstErrorMessage: string | null = null;
  
  for (const rule of rules) {
    const { value, errorMessage, validator } = rule;
    
    if (validator) {
      if (!validator(value)) {
        if (!hasError) {
          clearErrors(); // Effacer seulement au premier échec
          hasError = true;
          firstErrorMessage = errorMessage;
        }
        addError(errorMessage);
      }
    } else {
      // Validation par défaut : vérifier que la valeur existe et n'est pas vide
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        if (!hasError) {
          clearErrors(); // Effacer seulement au premier échec
          hasError = true;
          firstErrorMessage = errorMessage;
        }
        addError(errorMessage);
      }
    }
  }
  return firstErrorMessage;
};

const withLoading = <T>(store: any, methodName: string) => (source$: Observable<T>) =>
  source$.pipe(
    tap(() => updateState(store, `[${methodName}] start`, { isLoading: true })),
    finalize(() => updateState(store, `[${methodName}] end`, { isLoading: false }))
);

export interface SearchState {
  step: number;
  postId: number | PostgrestError | null;
  isLoading: boolean;
  error: string[];
  titre: string | null;
  description_meteo: string | null;
  phrase_accroche: string | null;
  article: string | null;
  new_href: string | null;
  citation: string | null;
  lien_url_article: string | null;
  categorie: string | null;
  image_url: string | null;
  video: string | null;
  postTitreAndId: { titre: string; id: number; new_href: string }[];
  faq: { question: string; response: string }[];
  internalImages: InternalImageData[];
}

const initialValue: SearchState = {
  step: 0,
  postId: null,
  isLoading: false,
  error: [],
  titre: null,
  description_meteo: null,
  phrase_accroche: null,
  article: null,
  new_href: null,
  citation: null,
  lien_url_article: null,
  categorie: null,
  image_url: null,
  video: null,
  postTitreAndId: [],
  faq: [],
  internalImages: []
}

export const SearchStore =  signalStore(
  { providedIn: 'root' },
  withDevtools('search'),
  withState(initialValue),
  withComputed((state) => ({
    isLoading: state.isLoading
  })),
  withMethods((store, infra = inject(Infrastructure), loggingService = inject(LoggingService))=> {
    
    // Méthodes helper pour la validation
    const clearErrors = () => patchState(store, { error: [] });
    const addError = (errorMessage: string) => {
      const currentErrors = store.error();
      patchState(store, { error: [...currentErrors, errorMessage] });
      loggingService.error('STORE', '❌ Erreur ajoutée', { errorMessage, totalErrors: currentErrors.length + 1 });
    };
    
    const validateWithErrorHandling = (rules: ValidationRule[]): string | null => {
      return validateStoreValues(store, rules, clearErrors, addError);
    };
    
    // Guards pour éviter les appels multiples simultanés
    const runningMethods = new Set<string>();
    
    const withMethodGuard = <T>(methodName: string, operation: () => Observable<T>): Observable<T> => {
      if (runningMethods.has(methodName)) {
        loggingService.warn('STORE', `🔒 Méthode ${methodName} déjà en cours, appel ignoré`);
        return of() as Observable<T>;
      }
      
      runningMethods.add(methodName);
      return operation().pipe(
        finalize(() => {
          runningMethods.delete(methodName);
          loggingService.info('STORE', `🔓 Méthode ${methodName} terminée`);
        })
      );
    };
    
    return ({
    getNextPostId: rxMethod<void>(
      pipe(
        concatMap(() =>
          (infra as Infrastructure).getNextPostId().pipe(
            withLoading(store, 'getNextPostId'),
            map((response: number | PostgrestError) => {
              return throwOnPostgrestError(response);
            }),
            tap({
              next: (postId: number) => { patchState(store, { postId }); },
              error: (error: unknown) => { store['addError'](extractErrorMessage(error)); }
            })
          )
        )
      )
    ),

    getLastPostTitreAndId: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.getLastPostTitreAndId().pipe(
            withLoading(store, 'getLastPostTitreAndId'),
            map((response: { titre: string; id: number; new_href: string }[] | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (postTitreAndId: { titre: string; id: number; new_href: string }[]) => patchState(store, { postTitreAndId }),
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          )
        )
      )
    ),
    
    setPost: rxMethod<string>(
      pipe(
        concatMap((articleIdea: string) =>
          infra.setPost(articleIdea).pipe(
            withLoading(store, 'setPost'),
            map((response: any | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (postData: any) => {
                patchState(store, {
                  titre: postData.titre || null,
                  description_meteo: postData.description_meteo || null,
                  phrase_accroche: postData.phrase_accroche || null,
                  article: postData.article || null,
                  new_href: postData.new_href || null,
                  citation: postData.citation || null,
                  lien_url_article: postData.lien_url_article?.lien1 || null,
                  categorie: postData.categorie || null
                });
                patchState(store, { step: 1 });
              },
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          )
        )
      )
    ),

    setImageUrl: rxMethod<void>(
      pipe(
        concatMap(() => {
          const phraseAccroche = store.phrase_accroche();
          const postId = store.postId();
          
          const validationError = validateWithErrorHandling([
            { value: phraseAccroche, errorMessage: 'La phrase d\'accroche doit être générée avant de créer l\'image' },
            { value: postId, errorMessage: 'Le postId doit être généré avant de créer la FAQ', validator: (val) => typeof val === 'number' }
          ]);
          
          if (validationError) {
            return [];
          }
          
          return infra.setImageUrl(phraseAccroche!, postId as number).pipe(
            withLoading(store, 'setImageUrl'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (imageUrl: string) => patchState(store, { image_url: imageUrl }),
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          );
        })
      )
    ),

    setVideo: rxMethod<void>(
      pipe(
        concatMap(() => withMethodGuard('setVideo', () => {
          const phrase_accroche = store.titre();
          const postId = store.postId();
          
          const validationError = validateWithErrorHandling([
            { value: phrase_accroche, errorMessage: 'Le titre doit être généré avant de rechercher une vidéo' },
            { value: postId, errorMessage: 'Le postId doit être généré avant de rechercher une vidéo', validator: (val) => typeof val === 'number' }
          ])
          if (validationError) { 
            return of(''); 
          }
          return infra.setVideo(phrase_accroche!, postId as number).pipe(
            withLoading(store, 'setVideo'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (video: string) => patchState(store, { video }),
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          );
        }))
      )
    ),

    setFaq: rxMethod<void>(
      pipe(
        concatMap(() => {
          const article = store.article();
          const validationError = validateWithErrorHandling([
            { value: article, errorMessage: 'L\'article doit être généré avant de créer la FAQ' },
          ]);
          
          if (validationError) {
            return [];
          }
          
          return infra.setFaq(article!).pipe(
            withLoading(store, 'setFaq'),
            map((response: { question: string; response: string }[] | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (faq: { question: string; response: string }[]) => patchState(store, { faq }),
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          );
        })
      )
    ),

    internalImage: rxMethod<void>(
      pipe(
        concatMap(() => withMethodGuard('internalImage', () => {
          const article = store.article();
          const postId = store.postId();
          
          const validationError = validateWithErrorHandling([
            { value: article, errorMessage: 'L\'article doit être généré avant d\'ajouter les images internes' },
            { value: postId, errorMessage: 'Le postId doit être généré avant d\'ajouter les images internes', validator: (val) => typeof val === 'number' }
          ]);
          if (validationError) { 
            return of({ article: '', images: [] }); 
          }
          
          return infra.internalImage(article!, postId as number).pipe(
            withLoading(store, 'internalImage'),
            map((response: { article: string; images: InternalImageData[] } | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (result: { article: string; images: InternalImageData[] }) => {
                patchState(store, { 
                  article: result.article, 
                  internalImages: result.images,
                  step: 2 
                });
                loggingService.info('STORE', '✅ Images internes ajoutées avec succès', { 
                  imagesCount: result.images.length 
                });
              },
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          );
        }))
      )
    ),

    setInternalLink: rxMethod<void>(
      pipe(
        concatMap(() => {
          const article = store.article();
          const postTitreAndId = store.postTitreAndId();
          
          const validationError = validateWithErrorHandling([
            { value: article, errorMessage: 'L\'article doit être généré avant d\'ajouter les liens internes' },
            { value: postTitreAndId, errorMessage: 'La liste des titres doit être récupérée avant d\'ajouter les liens internes', validator: (val) => Array.isArray(val) && val.length > 0 }
          ]);
          
          if (validationError) {
            return [];
          }
          
          return infra.setInternalLink(article!, postTitreAndId).pipe(
            withLoading(store, 'setInternalLink'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (upgradedArticle: string) => {
                patchState(store, { article: upgradedArticle, step: 3 });
              },
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          );
        })
      )
    ),

    vegetal: rxMethod<void>(
      pipe(
        concatMap(() => {
          const article = store.article();
          
          const validationError = validateWithErrorHandling([
            { value: article, errorMessage: 'L\'article doit être généré avant d\'ajouter les informations végétales' }
          ]);
          
          if (validationError) {
            return [];
          }
          
          return infra.vegetal(article!).pipe(
            withLoading(store, 'vegetal'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (upgradedArticle: string) => {
                patchState(store, { article: upgradedArticle, step: 4 });
              },
              error: (error: unknown) => store['addError'](extractErrorMessage(error))
            })
          );
        })
      )
    ),

    // Méthodes de mise à jour des champs individuels
    updateTitre: (titre: string) => {
      patchState(store, { titre });
      loggingService.info('STORE', '📝 Titre mis à jour', { titre });
    },

    updateDescriptionMeteo: (description_meteo: string) => {
      patchState(store, { description_meteo });
      loggingService.info('STORE', '🌤️ Description météo mise à jour', { description_meteo });
    },

    updatePhraseAccroche: (phrase_accroche: string) => {
      patchState(store, { phrase_accroche });
      loggingService.info('STORE', '✨ Phrase d\'accroche mise à jour', { phrase_accroche });
    },

    updateNewHref: (new_href: string) => {
      patchState(store, { new_href });
      loggingService.info('STORE', '🔗 New href mis à jour', { new_href });
    },

    updateCitation: (citation: string) => {
      patchState(store, { citation });
      loggingService.info('STORE', '💬 Citation mise à jour', { citation });
    },

    updateCategorie: (categorie: string) => {
      patchState(store, { categorie });
      loggingService.info('STORE', '🏷️ Catégorie mise à jour', { categorie });
    },

    updateArticle: (article: string) => {
      patchState(store, { article });
      loggingService.info('STORE', '📝 Article mis à jour', { length: article.length });
    },

    updateVideo: (video: string) => {
      patchState(store, { video });
      loggingService.info('STORE', '🎥 Vidéo mise à jour', { video });
    },

    updateFaqItem: (index: number, faqItem: { question: string; response: string }) => {
      const currentFaq = store.faq();
      const updatedFaq = [...currentFaq];
      updatedFaq[index] = faqItem;
      patchState(store, { faq: updatedFaq });
      loggingService.info('STORE', `❓ FAQ item ${index} mis à jour`, faqItem);
    },

    deleteFaqItem: (index: number) => {
      const currentFaq = store.faq();
      const updatedFaq = currentFaq.filter((_, i) => i !== index);
      patchState(store, { faq: updatedFaq });
      loggingService.info('STORE', `🗑️ FAQ item ${index} supprimé`);
    },

    addFaqItem: (faqItem: { question: string; response: string }) => {
      const currentFaq = store.faq();
      const updatedFaq = [...currentFaq, faqItem];
      patchState(store, { faq: updatedFaq });
      loggingService.info('STORE', '➕ Nouvel item FAQ ajouté', faqItem);
    },

    updateInternalImages: (images: InternalImageData[]) => {
      patchState(store, { internalImages: images });
      loggingService.info('STORE', '🖼️ Images internes mises à jour', { count: images.length });
    },

    clearErrors: () => {
      clearErrors();
      loggingService.info('STORE', '🧹 Erreurs effacées');
    },

    addError: (errorMessage: string) => {
      addError(errorMessage);
    },

    saveAllToSupabase: () => {
      const postId = store.postId();
      const article = store.article();
      const faq = store.faq();
      const internalImages = store.internalImages();
      
      if (typeof postId !== 'number' || !article) {
        loggingService.error('STORE', 'Impossible de sauvegarder - données manquantes', { postId, hasArticle: !!article });
        return;
      }
      
      loggingService.info('STORE', '💾 Début sauvegarde complète', {
        postId,
        faqCount: faq.length,
        imagesCount: internalImages.length
      });
      
      // 1️⃣ Sauvegarder le post complet
      infra.savePostComplete({
        id: postId,
        titre: store.titre() || '',
        description_meteo: store.description_meteo() || '',
        phrase_accroche: store.phrase_accroche() || '',
        article: article,
        citation: store.citation() || '',
        lien_url_article: { lien1: store.lien_url_article() || '' },
        categorie: store.categorie() || '',
        new_href: store.new_href() || ''
      }).pipe(
        withLoading(store, 'savePostComplete'),
        switchMap((postResult) => {
          loggingService.info('STORE', '✅ Post sauvegardé avec succès');
          
          // 2️⃣ Sauvegarder la FAQ (après le post)
          const faqSave$ = faq.length > 0 
            ? infra.saveFaqItems(postId, faq).pipe(
                tap({
                  next: () => loggingService.info('STORE', '✅ FAQ sauvegardée avec succès'),
                  error: (error) => store['addError'](`Erreur sauvegarde FAQ: ${error}`)
                })
              )
            : of(true);
            
          // 3️⃣ Sauvegarder les images internes (après le post)
          const imagesSave$ = internalImages.length > 0
            ? infra.saveInternalImages(postId, internalImages).pipe(
                tap({
                  next: () => loggingService.info('STORE', '✅ Images internes sauvegardées avec succès'),
                  error: (error) => store['addError'](`Erreur sauvegarde images: ${error}`)
                })
              )
            : of(true);
            
          // Exécuter FAQ et images en parallèle après le post
          return from([faqSave$, imagesSave$]).pipe(
            concatMap(save$ => save$),
            toArray()
          );
        }),
        tap(() => {
          loggingService.info('STORE', '🎉 Sauvegarde complète terminée avec succès');
        }),
        catchError((error) => {
          store['addError'](`Erreur sauvegarde: ${error}`);
          return of(null);
        })
      ).subscribe();
    }

  });
  })
);