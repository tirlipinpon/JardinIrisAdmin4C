import { signalStore, withState, withComputed, withMethods, patchState } from "@ngrx/signals";
import { updateState, withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { concatMap, finalize, map, Observable, pipe, tap } from "rxjs";
import { Infrastructure } from "../component/infrastructure/infrastructure";
import { PostgrestError } from "@supabase/supabase-js";
import { LoggingService } from "../../../shared/services/logging.service";

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

interface ValidationRule {
  value: any;
  errorMessage: string;
  validator?: (value: any) => boolean;
}

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
}

const initialValue: SearchState = {
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
  faq: []
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
          const phrase_accroche = store.phrase_accroche();
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
    )
  }))
);