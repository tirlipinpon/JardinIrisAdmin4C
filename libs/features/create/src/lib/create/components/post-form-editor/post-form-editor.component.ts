import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
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
import { LoggingService } from '@jardin-iris/core/data-access';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { generateAltFromImageUrl } from '../../utils/slug-formatter';

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
    MatDividerModule,
    NgOptimizedImage
  ],
  templateUrl: './post-form-editor.component.html',
  styleUrls: ['./post-form-editor.component.css']
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

  // trackBy functions to optimize ngFor rendering
  trackByCategory(index: number, item: { value: string; label: string }): string {
    return item.value;
  }

  trackByFaq(index: number, item: { question: string; response: string }): string {
    return item.question || String(index);
  }

  trackByInternalImage(index: number, item: any): string | number {
    return item?.id ?? index;
  }

  /**
   * Génère un attribut alt optimisé pour une image interne
   * @param imageUrl URL de l'image
   * @param fallbackKeyword Mot-clé de fallback
   * @returns Attribut alt formaté
   */
  generateImageAlt(imageUrl: string, fallbackKeyword: string): string {
    return generateAltFromImageUrl(imageUrl, fallbackKeyword);
  }
}
