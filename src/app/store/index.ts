import {signalStore, withState, withComputed, withMethods, patchState} from "@ngrx/signals";
import {tapResponse} from "@ngrx/operators";
import {updateState, withDevtools} from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { concatMap, pipe, tap } from "rxjs";
import { Infrastructure } from "../features/create/services/infrastructure"

export interface SearchState {
  test: string;
  isLoading: boolean;
  error: any;
}
const initialValue: SearchState = {
  test: '',
  isLoading: false,
  error: null
}
 export const SearchStore =  signalStore(
  { providedIn: 'root' },
  withDevtools('search'),
  withState(initialValue),
  withComputed((state) => ({
    isLoading: state.isLoading
  })),
  withMethods((store, infra = inject(Infrastructure))=> ( {
    test: rxMethod<string>(
      pipe(
        tap(()=> updateState(store, '[searchArticle] update loading', {isLoading: true})    ),
        concatMap((input: string) => {
          return infra.test(input).pipe(
            tapResponse({
              next: (response: string) => patchState(store, { test: response, isLoading: false }),
              error: error => patchState(store, {error: error, isLoading: false})
            })
          )
        })
      )
    ),
  }))
);