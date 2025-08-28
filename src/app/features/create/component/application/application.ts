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
    this.store.getNextPostId();
  }

  getLastPostTitreAndId(): void {
    this.store.getLastPostTitreAndId();
  }

  setPost(articleIdea: string): void {
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
