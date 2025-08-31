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
      const postId = this.store.postId();
      const article = this.store.article();
      const postTitreAndId = this.store.postTitreAndId();
      
      this.loggingService.info('APPLICATION', `🔄 Effect déclenché - Step: ${step}, PostId: ${typeof postId}, Article: ${!!article}, PostTitres: ${postTitreAndId.length}`);
      
      if (step === 1 && typeof postId === 'number' && article) {
        this.loggingService.info('APPLICATION', '🚀 Lancement des tâches step 1');
        this.store.setVideo();
        this.store.setFaq();
        this.store.internalImage();
        // this.store.setImageUrl();
      } else if (step === 2 && article && postTitreAndId.length > 0) {
        this.loggingService.info('APPLICATION', '🚀 Lancement des tâches step 2');
        this.store.setInternalLink();
      } else if (step === 3 && article) {
        this.loggingService.info('APPLICATION', '🚀 Lancement des tâches step 3');
        this.store.vegetal();
      } else if (step === 4 && article) {
        this.loggingService.info('APPLICATION', '✅ Step 4 terminé - Article prêt pour sauvegarde manuelle');
        // Plus de sauvegarde automatique - l'utilisateur doit cliquer sur le bouton
      }
    });
  }

  generate(articleIdea: string): void {
    this.store.getNextPostId();
    this.store.getLastPostTitreAndId();
    this.store.setPost(articleIdea);
  }



}
