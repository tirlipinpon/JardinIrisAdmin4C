import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
            <div class="video-info">
              <p><strong>URL Vidéo:</strong> {{ store.video() }}</p>
            </div>
            
            <div class="video-player" *ngIf="store.video() && extractVideoId(store.video()!)">
              <iframe 
                [src]="getYouTubeEmbedUrl(extractVideoId(store.video()!))" 
                width="100%" 
                height="315" 
                frameborder="0" 
                allowfullscreen>
              </iframe>
            </div>

            <div class="video-actions">
              <button mat-raised-button color="primary" (click)="editVideo()">
                <mat-icon>edit</mat-icon>
                Modifier la vidéo
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
    const url = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  editVideo() {
    this.loggingService.info('POST_FORM_EDITOR', '🎥 Modification de la vidéo demandée');
    // TODO: Implement video editing logic
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
