import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { SearchStore } from '../../store';
import { CathegoriesBlog } from '../../types/cathegoriesBlog';
import { LoggingService } from '../../../../shared/services/logging.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-post-form-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="post-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>📝 Édition des métadonnées de l'article</mat-card-title>
          <mat-card-subtitle>Modifiez les informations de votre article</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="postForm" class="post-form">
            
            <!-- Titre -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titre de l'article</mat-label>
              <input matInput formControlName="titre" placeholder="Entrez le titre de votre article">
              <mat-icon matSuffix>title</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="saveField('titre')"
                [class.disabled-button]="!isTitreDirty()"
                title="Sauvegarder le titre">
                <mat-icon>save</mat-icon>
              </button>
            </mat-form-field>

            <!-- Description météo -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description météo</mat-label>
              <textarea 
                matInput 
                formControlName="description_meteo" 
                placeholder="Description des conditions météorologiques"
                rows="3">
              </textarea>
              <mat-icon matSuffix>wb_sunny</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="saveField('description_meteo')"
                [class.disabled-button]="!isDescriptionMeteoDirty()"
                title="Sauvegarder la description météo">
                <mat-icon>save</mat-icon>
              </button>
            </mat-form-field>

            <!-- Phrase d'accroche -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phrase d'accroche</mat-label>
              <textarea 
                matInput 
                formControlName="phrase_accroche" 
                placeholder="Phrase d'accroche attractive pour l'article"
                rows="2">
              </textarea>
              <mat-icon matSuffix>format_quote</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="saveField('phrase_accroche')"
                [class.disabled-button]="!isPhraseAccrocheDirty()"
                title="Sauvegarder la phrase d'accroche">
                <mat-icon>save</mat-icon>
              </button>
            </mat-form-field>

            <!-- New href -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Lien de l'article (new_href)</mat-label>
              <input 
                matInput 
                formControlName="new_href" 
                placeholder="URL ou slug de l'article"
                type="url">
              <mat-icon matSuffix>link</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="saveField('new_href')"
                [class.disabled-button]="!isNewHrefDirty()"
                title="Sauvegarder le lien">
                <mat-icon>save</mat-icon>
              </button>
            </mat-form-field>

            <!-- Citation -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Citation</mat-label>
              <textarea 
                matInput 
                formControlName="citation" 
                placeholder="Citation inspirante pour l'article"
                rows="2">
              </textarea>
              <mat-icon matSuffix>format_quote</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="saveField('citation')"
                [class.disabled-button]="!isCitationDirty()"
                title="Sauvegarder la citation">
                <mat-icon>save</mat-icon>
              </button>
            </mat-form-field>

            <!-- Catégorie -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Catégorie</mat-label>
              <mat-select formControlName="categorie">
                <mat-option *ngFor="let category of categories" [value]="category.value">
                  {{ category.label }}
                </mat-option>
              </mat-select>
              <mat-icon matSuffix>category</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="saveField('categorie')"
                [class.disabled-button]="!isCategorieDirty()"
                title="Sauvegarder la catégorie">
                <mat-icon>save</mat-icon>
              </button>
            </mat-form-field>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- Section Vidéo -->
      <mat-card class="form-card" *ngIf="store.video()">
        <mat-card-header>
          <mat-card-title>🎥 Lecteur vidéo</mat-card-title>
          <mat-card-subtitle>Vidéo associée à l'article</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="video-section">
            <!-- Édition de l'URL vidéo -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL de la vidéo YouTube</mat-label>
              <input 
                matInput 
                [(ngModel)]="videoUrl" 
                placeholder="https://www.youtube.com/watch?v=..."
                type="url">
              <mat-icon matSuffix>video_library</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="saveVideoUrl()"
                [class.disabled-button]="!isVideoUrlDirty()"
                title="Sauvegarder l'URL vidéo">
                <mat-icon>save</mat-icon>
              </button>
            </mat-form-field>
            
            <!-- Aperçu de la vidéo -->
            <div class="video-player" *ngIf="videoUrl && extractVideoId(videoUrl)">
              <!-- Contrôles de mode d'affichage -->
              <div class="video-controls">
                <button 
                  mat-button 
                  [color]="usePreviewMode ? 'primary' : 'accent'"
                  (click)="toggleVideoMode()"
                  class="mode-toggle-btn">
                  <mat-icon>{{ usePreviewMode ? 'image' : 'play_circle' }}</mat-icon>
                  {{ usePreviewMode ? 'Mode Prévisualisation' : 'Mode Lecteur' }}
                </button>
                <span class="mode-description">
                  {{ usePreviewMode ? 'Aucun appel API - Image de prévisualisation' : 'Lecteur intégré (peut générer des appels)' }}
                </span>
              </div>

              <!-- Mode prévisualisation (recommandé) -->
              <div class="video-preview" *ngIf="usePreviewMode">
                <div class="video-thumbnail" (click)="openVideoInNewTab()">
                  <img 
                    [src]="getYouTubeThumbnailUrl(extractVideoId(videoUrl)!)" 
                    [alt]="'Aperçu de la vidéo YouTube'"
                    class="thumbnail-image">
                  <div class="play-overlay">
                    <mat-icon class="play-icon">play_circle_filled</mat-icon>
                    <p>Cliquer pour ouvrir sur YouTube</p>
                  </div>
                </div>
              </div>

              <!-- Mode lecteur intégré -->
              <div class="video-iframe" *ngIf="!usePreviewMode">
                <!-- Indicateur de chargement -->
                <div class="video-loading" *ngIf="videoLoading">
                  <mat-icon>refresh</mat-icon>
                  <p>Chargement de la vidéo...</p>
                  <button mat-button color="warn" (click)="forceStopLoading()" class="stop-loading-btn">
                    <mat-icon>stop</mat-icon>
                    Arrêter le chargement
                  </button>
                </div>
                
                <!-- Lecteur vidéo -->
                <iframe 
                  *ngIf="!videoLoading && !videoError"
                  [src]="getYouTubeEmbedUrl(extractVideoId(videoUrl)!)"
                  width="100%" 
                  height="315" 
                  frameborder="0" 
                  allowfullscreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  (load)="onVideoLoad()"
                  (error)="onVideoError()"
                  style="display: block; border: none;">
                </iframe>
                
                <!-- Message d'erreur -->
                <div class="video-error" *ngIf="videoError">
                  <mat-icon>error</mat-icon>
                  <p>Erreur lors du chargement de la vidéo. Veuillez vérifier l'URL.</p>
                  <button mat-button color="primary" (click)="retryVideo()">
                    <mat-icon>refresh</mat-icon>
                    Réessayer
                  </button>
                </div>
              </div>
            </div>

            <!-- Message si URL invalide -->
            <div class="video-error" *ngIf="videoUrl && !extractVideoId(videoUrl)">
              <mat-icon>warning</mat-icon>
              <p>URL YouTube invalide. Veuillez utiliser un format comme: https://www.youtube.com/watch?v=VIDEO_ID</p>
            </div>

            <div class="video-actions">
              <button mat-raised-button color="warn" (click)="removeVideo()" *ngIf="videoUrl">
                <mat-icon>delete</mat-icon>
                Supprimer la vidéo
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Section FAQ -->
      <mat-card class="form-card" *ngIf="store.faq().length > 0">
        <mat-card-header>
          <mat-card-title>❓ Questions fréquentes (FAQ)</mat-card-title>
          <mat-card-subtitle>{{ store.faq().length }} question(s) disponible(s)</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-accordion class="faq-accordion">
            <mat-expansion-panel *ngFor="let faqItem of store.faq(); let i = index" class="faq-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>help_outline</mat-icon>
                  Question {{ i + 1 }}
                </mat-panel-title>
                <mat-panel-description>
                  {{ faqItem.question | slice:0:50 }}{{ faqItem.question.length > 50 ? '...' : '' }}
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="faq-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Question</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="faqItem.question"
                    rows="2"
                    placeholder="Question FAQ">
                  </textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Réponse</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="faqItem.response"
                    rows="4"
                    placeholder="Réponse détaillée">
                  </textarea>
                </mat-form-field>

                <div class="faq-actions">
                  <button mat-raised-button color="primary" (click)="saveFaqItem(i)">
                    <mat-icon>save</mat-icon>
                    Sauvegarder
                  </button>
                  <button mat-button color="warn" (click)="deleteFaqItem(i)">
                    <mat-icon>delete</mat-icon>
                    Supprimer
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>

          <div class="faq-global-actions">
            <button mat-raised-button color="accent" (click)="addNewFaqItem()">
              <mat-icon>add</mat-icon>
              Ajouter une question
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Images internes -->
      <mat-card class="form-card" *ngIf="store.internalImages().length > 0">
        <mat-card-header>
          <mat-card-title>🖼️ Images internes</mat-card-title>
          <mat-card-subtitle>Gérez les images associées aux chapitres</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-accordion multi>
            <mat-expansion-panel *ngFor="let image of store.internalImages(); let i = index" class="image-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>image</mat-icon>
                  Chapitre {{ image.chapitre_id }} - {{ image.chapitre_key_word }}
                </mat-panel-title>
                <mat-panel-description>
                  {{ image.explanation_word }}
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="image-form">
                <div class="image-preview" *ngIf="image.url_Image">
                  <img [src]="image.url_Image" [alt]="image.chapitre_key_word" class="preview-img">
                </div>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Mot-clé du chapitre</mat-label>
                  <input matInput [(ngModel)]="image.chapitre_key_word" (ngModelChange)="updateInternalImage(i, 'chapitre_key_word', $event)">
                  <mat-icon matSuffix>label</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>URL de l'image</mat-label>
                  <input matInput [(ngModel)]="image.url_Image" (ngModelChange)="updateInternalImage(i, 'url_Image', $event)">
                  <mat-icon matSuffix>link</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Explication</mat-label>
                  <textarea matInput [(ngModel)]="image.explanation_word" (ngModelChange)="updateInternalImage(i, 'explanation_word', $event)" rows="2"></textarea>
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>

                <div class="image-actions">
                  <button mat-raised-button color="warn" (click)="removeInternalImage(i)">
                    <mat-icon>delete</mat-icon>
                    Supprimer l'image
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .post-form-container {
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-card {
      margin-bottom: 24px;
    }

    .post-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .video-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .video-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
    }

    .video-info p {
      margin: 8px 0;
    }

    .video-player {
      text-align: center;
    }

    .video-actions {
      text-align: center;
    }

    .faq-accordion {
      margin: 16px 0;
    }

    .faq-panel {
      margin-bottom: 8px;
    }

    .faq-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .faq-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .faq-global-actions {
      text-align: center;
      margin-top: 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-icon[matSuffix] {
      color: #666;
    }

    button[mat-icon-button][matSuffix] {
      color: #4CAF50;
    }

    button[mat-icon-button][matSuffix].disabled-button {
      color: #ccc !important;
      cursor: not-allowed;
      pointer-events: none;
    }

    .image-panel {
      margin-bottom: 8px;
    }

    .image-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .image-preview {
      text-align: center;
      margin-bottom: 16px;
    }

    .preview-img {
      max-width: 100%;
      max-height: 200px;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: block;
      margin: 0 auto;
    }

    .image-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    /* Responsive design pour les images */
    @media (max-width: 768px) {
      .preview-img {
        max-height: 150px;
      }
    }

         @media (max-width: 480px) {
       .preview-img {
         max-height: 120px;
       }
     }

     .video-error {
       display: flex;
       align-items: center;
       gap: 8px;
       padding: 12px;
       background: #fff3cd;
       border: 1px solid #ffeaa7;
       border-radius: 8px;
       color: #856404;
       margin: 16px 0;
     }

     .video-error mat-icon {
       color: #f39c12;
     }

     .video-error p {
       margin: 0;
       font-size: 14px;
     }

     .video-loading {
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       padding: 40px;
       background: #f8f9fa;
       border: 2px dashed #dee2e6;
       border-radius: 8px;
       color: #6c757d;
     }

     .video-loading mat-icon {
       font-size: 32px;
       width: 32px;
       height: 32px;
       margin-bottom: 12px;
       animation: spin 1s linear infinite;
     }

     .video-loading p {
       margin: 0;
       font-size: 14px;
       font-weight: 500;
     }

     .stop-loading-btn {
       margin-top: 12px;
       font-size: 12px;
     }

     .stop-loading-btn mat-icon {
       font-size: 16px;
       width: 16px;
       height: 16px;
       margin-right: 4px;
     }

     @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
     }

     .video-error {
       display: flex;
       flex-direction: column;
       align-items: center;
       gap: 12px;
       padding: 20px;
       background: #fff3cd;
       border: 1px solid #ffeaa7;
       border-radius: 8px;
       color: #856404;
       text-align: center;
     }

     .video-error mat-icon {
       font-size: 32px;
       width: 32px;
       height: 32px;
       color: #f39c12;
     }

     .video-error p {
       margin: 0;
       font-size: 14px;
       font-weight: 500;
     }

     .video-controls {
       display: flex;
       flex-direction: column;
       gap: 8px;
       margin-bottom: 16px;
       padding: 12px;
       background: #f8f9fa;
       border-radius: 8px;
       border: 1px solid #e9ecef;
     }

     .mode-toggle-btn {
       align-self: flex-start;
       font-weight: 500;
     }

     .mode-description {
       font-size: 12px;
       color: #6c757d;
       font-style: italic;
     }

     .video-preview {
       position: relative;
       width: 100%;
       max-width: 560px;
       margin: 0 auto;
     }

     .video-thumbnail {
       position: relative;
       cursor: pointer;
       border-radius: 8px;
       overflow: hidden;
       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
       transition: transform 0.3s ease, box-shadow 0.3s ease;
     }

     .video-thumbnail:hover {
       transform: translateY(-2px);
       box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
     }

     .thumbnail-image {
       width: 100%;
       height: auto;
       display: block;
     }

     .play-overlay {
       position: absolute;
       top: 0;
       left: 0;
       right: 0;
       bottom: 0;
       background: rgba(0, 0, 0, 0.6);
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       color: white;
       opacity: 0;
       transition: opacity 0.3s ease;
     }

     .video-thumbnail:hover .play-overlay {
       opacity: 1;
     }

     .play-icon {
       font-size: 64px !important;
       width: 64px !important;
       height: 64px !important;
       margin-bottom: 8px;
       color: #ff0000;
     }

     .play-overlay p {
       margin: 0;
       font-size: 14px;
       font-weight: 500;
       text-align: center;
     }

     .video-iframe {
       position: relative;
     }
   `]
})
export class PostFormEditorComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(SearchStore);
  private readonly loggingService = inject(LoggingService);
  private readonly sanitizer = inject(DomSanitizer);

   postForm!: FormGroup;
   categories = Object.values(CathegoriesBlog).map(value => ({
     value,
     label: value.charAt(0).toUpperCase() + value.slice(1)
   }));
   
   videoUrl = '';
   originalVideoUrl = '';
   videoLoading = false;
   videoError = false;
   usePreviewMode = true; // Mode prévisualisation pour éviter les appels generate_204

  constructor() {
    // Effet pour synchroniser automatiquement depuis le store
    effect(() => {
      // Synchroniser tous les champs du formulaire
      const currentPost = {
        titre: this.store.titre() || '',
        description_meteo: this.store.description_meteo() || '',
        phrase_accroche: this.store.phrase_accroche() || '',
        new_href: this.store.new_href() || '',
        citation: this.store.citation() || '',
        categorie: this.store.categorie() || ''
      };
      
      if (this.postForm) {
        this.postForm.patchValue(currentPost, { emitEvent: false });
      }
      
      // Synchroniser l'URL vidéo
      const storeVideo = this.store.video() || '';
      if (storeVideo !== this.videoUrl) {
        this.videoUrl = storeVideo;
        this.originalVideoUrl = this.videoUrl;
        this.videoLoading = false; // Ne pas bloquer l'affichage
        this.videoError = false;
        
        this.loggingService.info('POST_FORM_EDITOR', '🔄 Synchronisation vidéo depuis le store', { videoUrl: this.videoUrl });
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadDataFromStore();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private initializeForm() {
    this.postForm = this.fb.group({
      titre: [''],
      description_meteo: [''],
      phrase_accroche: [''],
      new_href: [''],
      citation: [''],
      categorie: ['']
    });
  }

  private loadDataFromStore() {
    // Load existing data from store
    const currentPost = {
      titre: this.store.titre() || '',
      description_meteo: this.store.description_meteo() || '',
      phrase_accroche: this.store.phrase_accroche() || '',
      new_href: this.store.new_href() || '',
      citation: this.store.citation() || '',
      categorie: this.store.categorie() || ''
    };

    this.postForm.patchValue(currentPost);
    
    // Load video URL
    this.videoUrl = this.store.video() || '';
    this.originalVideoUrl = this.videoUrl;
    
    // Mark form as pristine after initial load
    this.postForm.markAsPristine();
  }

  // Methods to check if fields are dirty
  isTitreDirty(): boolean {
    return this.postForm.get('titre')?.dirty || false;
  }

  isDescriptionMeteoDirty(): boolean {
    return this.postForm.get('description_meteo')?.dirty || false;
  }

  isPhraseAccrocheDirty(): boolean {
    return this.postForm.get('phrase_accroche')?.dirty || false;
  }

  isNewHrefDirty(): boolean {
    return this.postForm.get('new_href')?.dirty || false;
  }

  isCitationDirty(): boolean {
    return this.postForm.get('citation')?.dirty || false;
  }

  isCategorieDirty(): boolean {
    return this.postForm.get('categorie')?.dirty || false;
  }

  saveField(fieldName: string) {
    const value = this.postForm.get(fieldName)?.value;
    
    this.loggingService.info('POST_FORM_EDITOR', `💾 Sauvegarde du champ ${fieldName}`, { value });
    
    // Call store method to update the specific field
    switch (fieldName) {
      case 'titre':
        this.store.updateTitre(value);
        break;
      case 'description_meteo':
        this.store.updateDescriptionMeteo(value);
        break;
      case 'phrase_accroche':
        this.store.updatePhraseAccroche(value);
        break;
      case 'new_href':
        this.store.updateNewHref(value);
        break;
      case 'citation':
        this.store.updateCitation(value);
        break;
      case 'categorie':
        this.store.updateCategorie(value);
        break;
    }

    // Mark field as pristine after save
    this.postForm.get(fieldName)?.markAsPristine();
  }

  extractVideoId(videoUrl: string): string {
    // Extract video ID from YouTube URL
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoUrl.match(regex);
    return match ? match[1] : '';
  }

  getYouTubeEmbedUrl(videoId: string): SafeResourceUrl {
    // Paramètres optimisés pour éliminer les appels generate_204 et améliorer les performances
    const url = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=0&cc_load_policy=0&iv_load_policy=3&autohide=0&controls=1&disablekb=1&enablejsapi=0&origin=${window.location.origin}&widget_referrer=${window.location.origin}&html5=1&wmode=opaque&playsinline=1&mute=0&loop=0&autoplay=0&start=0&end=0&showinfo=0&theme=light&color=white`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getYouTubeThumbnailUrl(videoId: string): string {
    // URL de prévisualisation YouTube haute qualité
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  getYouTubeWatchUrl(videoId: string): string {
    // URL pour ouvrir la vidéo dans un nouvel onglet
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

     isVideoUrlDirty(): boolean {
     return this.videoUrl !== this.originalVideoUrl;
   }

   saveVideoUrl() {
     if (!this.isVideoUrlDirty()) return;
     
     this.loggingService.info('POST_FORM_EDITOR', '🎥 Sauvegarde URL vidéo', { videoUrl: this.videoUrl });
     
     // Mettre à jour le store avec la nouvelle URL
     this.store.updateVideo(this.videoUrl);
     this.originalVideoUrl = this.videoUrl;
   }

   removeVideo() {
     this.loggingService.info('POST_FORM_EDITOR', '🗑️ Suppression de la vidéo');
     
     this.videoUrl = '';
     this.originalVideoUrl = '';
     this.videoLoading = false;
     this.videoError = false;
     this.store.updateVideo('');
   }

  onVideoLoad() {
    this.loggingService.info('POST_FORM_EDITOR', '✅ Vidéo chargée avec succès');
    this.videoLoading = false;
    this.videoError = false;
  }

  onVideoError() {
    this.loggingService.error('POST_FORM_EDITOR', '❌ Erreur lors du chargement de la vidéo');
    this.videoLoading = false;
    this.videoError = true;
  }

  retryVideo() {
    this.loggingService.info('POST_FORM_EDITOR', '🔄 Nouvelle tentative de chargement de la vidéo');
    this.videoLoading = true;
    this.videoError = false;
    this.startVideoLoadTimeout();
  }

  // Méthode pour forcer l'arrêt du chargement
  forceStopLoading() {
    this.loggingService.info('POST_FORM_EDITOR', '🛑 Arrêt forcé du chargement de la vidéo');
    this.videoLoading = false;
    this.videoError = false;
  }

  toggleVideoMode() {
    this.usePreviewMode = !this.usePreviewMode;
    this.loggingService.info('POST_FORM_EDITOR', `🔄 Basculement vers le mode ${this.usePreviewMode ? 'Prévisualisation' : 'Lecteur'}`);
    
    // Réinitialiser les états d'erreur lors du changement de mode
    this.videoLoading = false;
    this.videoError = false;
  }

  openVideoInNewTab() {
    const videoId = this.extractVideoId(this.videoUrl);
    if (videoId) {
      const watchUrl = this.getYouTubeWatchUrl(videoId);
      this.loggingService.info('POST_FORM_EDITOR', '🔗 Ouverture de la vidéo dans un nouvel onglet', { watchUrl });
      window.open(watchUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // Méthode pour forcer l'arrêt du chargement après un délai
  private startVideoLoadTimeout() {
    // Arrêter le chargement après 10 secondes maximum
    setTimeout(() => {
      if (this.videoLoading) {
        this.loggingService.warn('POST_FORM_EDITOR', '⏰ Timeout du chargement de la vidéo');
        this.videoLoading = false;
        this.videoError = true;
      }
    }, 10000);
  }

  saveFaqItem(index: number) {
    const faqItems = this.store.faq();
    const faqItem = faqItems[index];
    
    this.loggingService.info('POST_FORM_EDITOR', `💾 Sauvegarde FAQ item ${index}`, faqItem);
    
    // Call store method to update FAQ item
    this.store.updateFaqItem(index, faqItem);
  }

  deleteFaqItem(index: number) {
    this.loggingService.info('POST_FORM_EDITOR', `🗑️ Suppression FAQ item ${index}`);
    
    // Call store method to delete FAQ item
    this.store.deleteFaqItem(index);
  }

  addNewFaqItem() {
    this.loggingService.info('POST_FORM_EDITOR', '➕ Ajout d\'une nouvelle question FAQ');
    
    // Call store method to add new FAQ item
    this.store.addFaqItem({ question: 'Nouvelle question', response: 'Nouvelle réponse' });
  }

  updateInternalImage(index: number, field: string, value: string) {
    this.loggingService.info('POST_FORM_EDITOR', `🖼️ Mise à jour image interne ${index}`, { field, value });
    
    const currentImages = this.store.internalImages();
    const updatedImages = [...currentImages];
    (updatedImages[index] as any)[field] = value;
    
    // Mettre à jour le store avec la nouvelle liste
    this.store.updateInternalImages(updatedImages);
  }

  removeInternalImage(index: number) {
    this.loggingService.info('POST_FORM_EDITOR', `🗑️ Suppression image interne ${index}`);
    
    const currentImages = this.store.internalImages();
    const updatedImages = currentImages.filter((_, i) => i !== index);
    
    this.store.updateInternalImages(updatedImages);
  }
}
