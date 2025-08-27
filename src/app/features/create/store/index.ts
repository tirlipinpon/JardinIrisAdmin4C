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
  // Champs existants
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
  image_url: string | null;
  categorie: string | null;
}

const initialValue: SearchState = {
  // Champs existants
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
  image_url: null,
  categorie: null
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

    setTitre: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setTitre().pipe(
            withLoading(store, 'setTitre'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (titre: string) => patchState(store, { titre }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),
    
    setDescriptionMeteo: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setDescriptionMeteo().pipe(
            withLoading(store, 'setDescriptionMeteo'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (descriptionMeteo: string) => patchState(store, { description_meteo: descriptionMeteo }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),
    
    setPhraseAccroche: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setPhraseAccroche().pipe(
            withLoading(store, 'setPhraseAccroche'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (phraseAccroche: string) => patchState(store, { phrase_accroche: phraseAccroche }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),
    
    setArticle: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setArticle().pipe(
            withLoading(store, 'setArticle'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (article: string) => patchState(store, { article }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),
    
    setNewHref: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setNewHref().pipe(
            withLoading(store, 'setNewHref'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (newHref: string) => patchState(store, { new_href: newHref }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),
    
    setCitation: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setCitation().pipe(
            withLoading(store, 'setCitation'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (citation: string) => patchState(store, { citation }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    ),
    
    setLienUrlArticle: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setLienUrlArticle().pipe(
            withLoading(store, 'setLienUrlArticle'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (lienUrlArticle: string) => patchState(store, { lien_url_article: lienUrlArticle }),
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
    
    setCategorie: rxMethod<void>(
      pipe(
        concatMap(() =>
          infra.setCategorie().pipe(
            withLoading(store, 'setCategorie'),
            map((response: string | PostgrestError) => throwOnPostgrestError(response)),
            tap({
              next: (categorie: string) => patchState(store, { categorie }),
              error: (error: unknown) => patchState(store, { error: [extractErrorMessage(error)] })
            })
          )
        )
      )
    )
  }))
);