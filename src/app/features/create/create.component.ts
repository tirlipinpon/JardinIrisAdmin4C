import { CommonModule } from '@angular/common';
import { Component, inject, effect, signal } from '@angular/core';
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
import { PerformanceService } from '../../shared/services/performance.service';
import { Application } from './component/application/application';
import { SearchStore } from './store';
import { ArticleEditorComponent } from './components/article-editor/article-editor.component';
import { PostFormEditorComponent } from './components/post-form-editor/post-form-editor.component';
import { ProcessCompletionDialogComponent } from './components/process-completion-dialog/process-completion-dialog.component';
import { PerformanceDisplayComponent } from './components/performance-display/performance-display.component';
import { ErrorDisplayComponent } from './components/error-display/error-display.component';
import { ArticleGenerationComponent } from './components/article-generation/article-generation.component';
import { ArticleStatsComponent } from './components/article-stats/article-stats.component';
import { ImagePreviewComponent } from './components/image-preview/image-preview.component';

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
    PostFormEditorComponent,
    PerformanceDisplayComponent,
    ErrorDisplayComponent,
    ArticleGenerationComponent,
    ArticleStatsComponent,
    ImagePreviewComponent
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {
  private readonly application = inject(Application);
  private readonly loggingService = inject(LoggingService);
  private readonly versionService = inject(VersionService);
  private readonly performanceService = inject(PerformanceService);
  private readonly dialog = inject(MatDialog);
  readonly store = inject(SearchStore);
  
  articleIdea = '';
  showCompletionDialog = false;

  // Signals pour contrôler la visibilité de chaque section
  readonly showPerformance = signal(true);
  readonly showErrors = signal(true);
  readonly showGeneration = signal(true);
  readonly showStats = signal(true);
  readonly showImagePreview = signal(true);
  readonly showEditor = signal(true);
  readonly showFormEditor = signal(true);

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
    
    // Mesurer les performances de la génération complète
    this.performanceService.measure(
      'generateArticle',
      'Article Generation',
      () => {
        this.application.generate(this.articleIdea);
      }
    );
    
    // Afficher le résumé des performances après un délai
    setTimeout(() => {
      this.performanceService.logSummary();
    }, 2000);
  }

  onArticleIdeaChange(value: string): void {
    this.articleIdea = value;
  }

  // Méthodes pour toggle chaque section
  togglePerformance(): void {
    this.showPerformance.set(!this.showPerformance());
  }

  toggleErrors(): void {
    this.showErrors.set(!this.showErrors());
  }

  toggleGeneration(): void {
    this.showGeneration.set(!this.showGeneration());
  }

  toggleStats(): void {
    this.showStats.set(!this.showStats());
  }

  toggleImagePreview(): void {
    this.showImagePreview.set(!this.showImagePreview());
  }

  toggleEditor(): void {
    this.showEditor.set(!this.showEditor());
  }

  toggleFormEditor(): void {
    this.showFormEditor.set(!this.showFormEditor());
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

  showPerformanceStats() {
    this.loggingService.info('COMPONENT', '📊 Affichage des statistiques de performance');
    this.performanceService.logSummary();
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

  editImageUrl() {
    const currentImageUrl = this.store.image_url();
    if (currentImageUrl) {
      const newImageUrl = prompt('Modifier l\'URL de l\'image principale:', currentImageUrl);
      if (newImageUrl !== null && newImageUrl !== currentImageUrl) {
        this.store.updateImageUrl(newImageUrl);
        this.loggingService.info('COMPONENT', '🖼️ URL image principale mise à jour', { 
          oldUrl: currentImageUrl, 
          newUrl: newImageUrl 
        });
      }
    }
  }

  openImageInNewTab() {
    const imageUrl = this.store.image_url();
    if (imageUrl) {
      window.open(imageUrl, '_blank');
      this.loggingService.info('COMPONENT', '🖼️ Image ouverte dans un nouvel onglet', { imageUrl });
    }
  }

  onImageError(event: Event) {
    this.loggingService.error('COMPONENT', '❌ Erreur de chargement de l\'image', event);
  }

  onImageLoad(event: Event) {
    this.loggingService.info('COMPONENT', '✅ Image chargée avec succès');
  }

  canSave(): boolean {
    return !!(this.store.postId() && this.store.article() && typeof this.store.postId() === 'number');
  }

  saveAllData() {
    if (this.canSave()) {
      this.loggingService.info('COMPONENT', '💾 Déclenchement sauvegarde manuelle');
      this.store.saveAllToSupabase();
      
      // Reset complet après un délai pour laisser le temps à la sauvegarde
      setTimeout(() => {
        this.resetAll();
      }, 2000);
    }
  }

  /**
   * Reset complet de l'application après sauvegarde
   */
  resetAll() {
    this.loggingService.info('COMPONENT', '🔄 Reset complet de l\'application');
    
    // Reset du store
    this.store.resetAll();
    
    // Reset des variables locales
    this.articleIdea = '';
    this.showCompletionDialog = false;
    
    // Fermer toutes les sections (sauf la génération)
    this.showPerformance.set(false);
    this.showErrors.set(false);
    this.showGeneration.set(true); // Garder la génération ouverte
    this.showStats.set(false);
    this.showImagePreview.set(false);
    this.showEditor.set(false);
    this.showFormEditor.set(false);
    
    // Clear des métriques de performance
    this.performanceService.clearMetrics();
    
    this.loggingService.info('COMPONENT', '✅ Reset complet terminé');
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