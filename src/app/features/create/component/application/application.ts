import { inject, Injectable, effect } from '@angular/core';
import { SearchStore } from '../../store';
import { LoggingService } from '../../../../shared/services/logging.service';


@Injectable({
  providedIn: 'root'
})
export class Application {
  private readonly store = inject(SearchStore);
  private readonly loggingService = inject(LoggingService);
  private shouldGenerateFaq = false;

  constructor() {
    effect(() => {
      const article = this.store.article();
      if (this.shouldGenerateFaq && article && article.trim() !== '') {
        this.shouldGenerateFaq = false;
        this.store.setFaq();
      }
    });
  }

  generate(articleIdea: string): void {
    this.shouldGenerateFaq = true;
    this.store.getNextPostId();
    this.store.getLastPostTitreAndId();
    this.store.setPost(articleIdea);
  }

  setImageUrl(): void {
    this.store.setImageUrl();
  }

  setVideo(): void {
    this.store.setVideo();
  }

  setFaq(): void {
    this.store.setFaq();
  }
}
