import { inject, Injectable, effect } from '@angular/core';
import { SearchStore } from '../../store';
import { LoggingService } from '../../../../shared/services/logging.service';


@Injectable({
  providedIn: 'root'
})
export class Application {
  private readonly store = inject(SearchStore);
  private readonly loggingService = inject(LoggingService);

  constructor() {
    effect(() => {
      const step = this.store.step();
      if (step === 1) {
        this.store.setVideo();
        this.store.setFaq();
        this.store.internalImage();
        // this.store.setImageUrl();
      } else if (step === 2) {
        this.store.setInternalLink();
      } else if (step === 3) {
        this.store.vegetal();
      }
    });
  }

  generate(articleIdea: string): void {
    this.store.getNextPostId();
    this.store.getLastPostTitreAndId();
    this.store.setPost(articleIdea);
  }



}
