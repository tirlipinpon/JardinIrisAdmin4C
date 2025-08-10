import { inject, Injectable } from '@angular/core';
import { SearchStore } from '../store';

@Injectable({
  providedIn: 'root'
})
export class Application {
  private readonly store = inject(SearchStore);
  
  test(url_post: string): void {
    this.store.test(url_post);
  }
}
