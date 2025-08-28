import { inject, Injectable } from '@angular/core';
import { SearchStore } from '../../store';
import { LoggingService } from '../../../../shared/services/logging.service';


@Injectable({
  providedIn: 'root'
})
export class Application {
  private readonly store = inject(SearchStore);
  private readonly loggingService = inject(LoggingService);
  
  getNextPostId(): void {
    this.loggingService.info('APPLICATION', '🔄 Début getNextPostId()');    
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

  setVideo(): void {
    this.store.setVideo();
  }

  setPostTitreAndId(): void {
    this.store.setPostTitreAndId();
  }

  setFaq(): void {
    this.store.setFaq();
  }
}
