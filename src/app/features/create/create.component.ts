import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoggingService } from '../../shared/services/logging.service';
import { VersionService } from '../../shared/services/versions/versions.service';
import { Application } from './component/application/application';
import { SearchStore } from './store';
import { ArticleEditorComponent } from './components/article-editor/article-editor.component';
import { PostFormEditorComponent } from './components/post-form-editor/post-form-editor.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ArticleEditorComponent, PostFormEditorComponent],
  templateUrl: './create.component.html'
})
export class CreateComponent {
  private readonly application = inject(Application);
  private readonly loggingService = inject(LoggingService);
  private readonly versionService = inject(VersionService);
  readonly store = inject(SearchStore);
  
  articleIdea = '';

  constructor() {
    // Afficher la version au démarrage
    this.versionService.logToConsole();
  }

  generate() {
    this.loggingService.info('COMPONENT', '🚀 Début appel generate()');    
    this.application.generate(this.articleIdea);
  }

  onArticleChange(newArticle: string) {
    this.loggingService.info('COMPONENT', '📝 Article modifié dans l\'éditeur');
    // TODO: Mettre à jour l'article dans le store si nécessaire
  }

  clearErrors() {
    this.loggingService.info('COMPONENT', '🧹 Nettoyage des erreurs');
    this.store['clearErrors']();
  }

  trackByIndex(index: number, item: string): number {
    return index;
  }
} 