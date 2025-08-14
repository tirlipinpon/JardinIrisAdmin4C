import { signalStore, withState, withComputed, withMethods, patchState } from "@ngrx/signals";
import { tapResponse } from "@ngrx/operators";
import { updateState, withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { concatMap, map, pipe, tap } from "rxjs";
import { Infrastructure } from "../services/infrastructure/infrastructure";
import { PostgrestError } from "@supabase/supabase-js";

function throwOnError<T, E>(response: T | E, errorCheck: (val: any) => val is E): T {
  if (errorCheck(response)) {
    throw response;
  }
  return response;
}

// Fonction spécialisée pour PostgrestError
const throwOnPostgrestError = <T>(response: T | PostgrestError) => 
  throwOnError(response, (val): val is PostgrestError => val instanceof PostgrestError);

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
  withMethods((store, infra = inject(Infrastructure))=> ( {
    getNextPostId: rxMethod<void>(
      pipe(
        tap(()=> updateState(store, '[getNextPostId] update loading', {isLoading: true})    ),
        concatMap(() => {
          return (infra as Infrastructure).getNextPostId().pipe(
            map((response: number | PostgrestError) => throwOnPostgrestError(response)),
            tapResponse({
              next: (response: number | PostgrestError) => patchState(store, { postId: response, isLoading: false }),
              error: error => patchState(store, {error: [String(error)], isLoading: false})
            })
          )
        })
      )
    ),
  }))
);