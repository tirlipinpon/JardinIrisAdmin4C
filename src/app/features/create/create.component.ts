import { CommonModule } from '@angular/common';
import { Component, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LoggingService } from '../../shared/services/logging.service';
import { VersionService } from '../../shared/services/versions/versions.service';
import { Application } from './component/application/application';
import { SearchStore } from './store';
import { ArticleEditorComponent } from './components/article-editor/article-editor.component';
import { PostFormEditorComponent } from './components/post-form-editor/post-form-editor.component';
import { ProcessCompletionDialogComponent } from './components/process-completion-dialog/process-completion-dialog.component';

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
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    ArticleEditorComponent, 
    PostFormEditorComponent
  ],
  templateUrl: './create.component.html'
})
export class CreateComponent {
  private readonly application = inject(Application);
  private readonly loggingService = inject(LoggingService);
  private readonly versionService = inject(VersionService);
  private readonly dialog = inject(MatDialog);
  readonly store = inject(SearchStore);
  
  articleIdea = '';
  showCompletionDialog = false;

  constructor() {
    // Afficher la version au démarrage
    this.versionService.logToConsole();
    
    // Effet pour détecter la fin du processus
    effect(() => {
      const step = this.store.step();
      const isGenerating = this.store.isGenerating();
      const article = this.store.article();
      
      // Si on est à l'étape 4, qu'on n'est plus en génération et qu'on a un article
      if (step === 4 && !isGenerating && article && !this.showCompletionDialog) {
        this.showCompletionDialog = true;
        this.showProcessCompletionDialog();
      }
    });
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
    this.store.clearErrors();
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

  getInternalLinksStats() {
    const article = this.store.article() || '';
    
    // Compter tous les liens internes (balises <a>)
    const allLinks = article.match(/<a[^>]*class=['"]myTooltip['"][^>]*>/g) || [];
    const totalLinks = allLinks.length;
    
    // Extraire les URLs pour compter les uniques
    const urls = allLinks.map(link => {
      const urlMatch = link.match(/href=['"]([^'"]*)['"]/);
      return urlMatch ? urlMatch[1] : '';
    }).filter(url => url);
    
    const uniqueUrls = new Set(urls);
    const uniqueLinks = uniqueUrls.size;
    
    return {
      total: totalLinks,
      unique: uniqueLinks,
      duplicates: totalLinks - uniqueLinks
    };
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


  private showProcessCompletionDialog() {
    const stats = this.getArticleStats();
    const internalLinksStats = this.getInternalLinksStats();
    const botanicalCount = this.getBotanicalNamesCount();
    
    const dialogRef = this.dialog.open(ProcessCompletionDialogComponent, {
      width: '600px',
      data: {
        stats,
        internalLinksStats,
        botanicalCount,
        faqCount: this.store.faq().length,
        imagesCount: this.store.internalImages().length,
        hasVideo: !!this.store.video()
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.showCompletionDialog = false;
      if (result === 'save') {
        this.saveAllData();
      }
    });
  }
} 