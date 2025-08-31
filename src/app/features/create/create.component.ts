import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { LoggingService } from '../../shared/services/logging.service';
import { VersionService } from '../../shared/services/versions/versions.service';
import { Application } from './component/application/application';
import { SearchStore } from './store';
import { ArticleEditorComponent } from './components/article-editor/article-editor.component';
import { PostFormEditorComponent } from './components/post-form-editor/post-form-editor.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    ArticleEditorComponent, 
    PostFormEditorComponent
  ],
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
    this.loggingService.info('COMPONENT', '📝 Article modifié dans l\'éditeur', { length: newArticle.length });
    // Mettre à jour l'article dans le store
    this.store.updateArticle(newArticle);
  }

  clearErrors() {
    this.loggingService.info('COMPONENT', '🧹 Nettoyage des erreurs');
    this.store['clearErrors']();
  }

  trackByIndex(index: number, item: string): number {
    return index;
  }

  getArticleStats() {
    const article = this.store.article() || '';
    const characters = article.length;
    const words = article.split(/\s+/).filter(word => word.length > 0).length;
    const paragraphs = (article.match(/<span id=['"]paragraphe-\d+['"]/g) || []).length;
    
    return { characters, words, paragraphs };
  }

  getBotanicalNamesCount(): number {
    const article = this.store.article() || '';
    return (article.match(/<span class=['"]inat-vegetal['"]/g) || []).length;
  }

  canSave(): boolean {
    return !!(this.store.postId() && this.store.article() && typeof this.store.postId() === 'number');
  }

  saveAllData() {
    if (this.canSave()) {
      this.loggingService.info('COMPONENT', '💾 Déclenchement sauvegarde manuelle');
      this.store.saveAllToSupabase();
    }
  }
} 