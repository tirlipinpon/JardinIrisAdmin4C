import { inject, Injectable } from '@angular/core';
import { SearchStore } from '../../store';


@Injectable({
  providedIn: 'root'
})
export class Application {
  private readonly store = inject(SearchStore);
  
  getNextPostId(): void {
    this.store.getNextPostId();
  }

  setTitre(): void {
    this.store.setTitre();
  }

  setDescriptionMeteo(): void {
    this.store.setDescriptionMeteo();
  }

  setPhraseAccroche(): void {
    this.store.setPhraseAccroche();
  }

  setArticle(): void {
    this.store.setArticle();
  }

  setNewHref(): void {
    this.store.setNewHref();
  }

  setCitation(): void {
    this.store.setCitation();
  }

  setLienUrlArticle(): void {
    this.store.setLienUrlArticle();
  }

  setImageUrl(): void {
    this.store.setImageUrl();
  }

  setCategorie(): void {
    this.store.setCategorie();
  }
}
