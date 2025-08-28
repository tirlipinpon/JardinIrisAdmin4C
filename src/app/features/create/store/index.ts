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
        tap(() => {
          loggingService.info('STORE', '⚡ Début getNextPostId()');
        }),
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
        concatMap(() =>
          infra.setImageUrl().pipe(
            withLoading(store, 'setImageUrl'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (imageUrl: string) => patchState(store, { image_url: imageUrl }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),

    setVideo: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setVideo().pipe(
            withLoading(store, 'setVideo'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (video: string) => patchState(store, { video }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),

    setPostTitreAndId: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setPostTitreAndId().pipe(
            withLoading(store, 'setPostTitreAndId'),
            map((response: { titre: string; id: number; new_href: string }[] | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (postTitreAndId: { titre: string; id: number; new_href: string }[]) => patchState(store, { postTitreAndId }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),

    setFaq: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setFaq().pipe(
            withLoading(store, 'setFaq'),
            map((response: { question: string; response: string }[] | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (faq: { question: string; response: string }[]) => patchState(store, { faq }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    )
  }))
);