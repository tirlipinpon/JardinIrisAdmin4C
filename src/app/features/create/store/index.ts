import { signalStore, withState, withComputed, withMethods, patchState } from "@ngrx/signals";
import { updateState, withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { concatMap, finalize, map, Observable, pipe, tap } from "rxjs";
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


const validateStoreValues = (store: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    const { value, errorMessage, validator } = rule;
    
    if (validator) {
      if (!validator(value)) {
        patchState(store, { error: [errorMessage] });
        return errorMessage;
      }
    } else {
      // Validation par défaut : vérifier que la valeur existe et n'est pas vide
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        patchState(store, { error: [errorMessage] });
        return errorMessage;
      }
    }
  }
  return null;
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
  withMethods((store, infra = inject(Infrastructure), loggingService = inject(LoggingService))=> ( {
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
              error: (error: unknown) => { patchState(store, { error: [extractErrorMessage(error)] }); }
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
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
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
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
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
          
          const validationError = validateStoreValues(store, [
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
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          );
        })
      )
    ),

    setVideo: rxMethod<void>(
      pipe(
        concatMap(() => {
          const phrase_accroche = store.titre();
          const postId = store.postId();
          
          const validationError = validateStoreValues(store, [
            { value: phrase_accroche, errorMessage: 'Le titre doit être généré avant de rechercher une vidéo' },
            { value: postId, errorMessage: 'Le postId doit être généré avant de rechercher une vidéo', validator: (val) => typeof val === 'number' }
          ])
          if (validationError) { return []; }
          return infra.setVideo(phrase_accroche!, postId as number).pipe(
            withLoading(store, 'setVideo'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (video: string) => patchState(store, { video }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          );
        })
      )
    ),

    setFaq: rxMethod<void>(
      pipe(
        concatMap(() => {
          const article = store.article();
          const validationError = validateStoreValues(store, [
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
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          );
        })
      )
    ),

    internalImage: rxMethod<void>(
      pipe(
        concatMap(() => {
          const article = store.article();
          const postId = store.postId();
          
          const validationError = validateStoreValues(store, [
            { value: article, errorMessage: 'L\'article doit être généré avant d\'ajouter les images internes' },
            { value: postId, errorMessage: 'Le postId doit être généré avant d\'ajouter les images internes', validator: (val) => typeof val === 'number' }
          ]);
          if (validationError) { return []; }
          
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
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          );
        })
      )
    ),

    setInternalLink: rxMethod<void>(
      pipe(
        concatMap(() => {
          const article = store.article();
          const postTitreAndId = store.postTitreAndId();
          
          const validationError = validateStoreValues(store, [
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
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          );
        })
      )
    ),

    vegetal: rxMethod<void>(
      pipe(
        concatMap(() => {
          const article = store.article();
          
          const validationError = validateStoreValues(store, [
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
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
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
    }

  }))
);