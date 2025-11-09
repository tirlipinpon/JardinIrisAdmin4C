import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { LoggingService, SupabaseService, ImageProcessingService } from '@jardin-iris/core/data-access';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { ImageDescriptionService } from '../image-description/image-description.service';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly loggingService = inject(LoggingService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly imageProcessingService = inject(ImageProcessingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);
  private readonly imageDescriptionService = inject(ImageDescriptionService);

  generateAndUploadImage(phraseAccroche: string, postId: number, useMock = false): Observable<string> {
    return from((async () => {
      console.log('🚀 [IMAGE_UPLOAD_SVC] ===== DÉBUT GÉNÉRATION IMAGE PRINCIPALE =====', { postId, useMock });
      
      // Étape 1 : Générer l'image via DALL-E (ou mock)
      let b64_json: string | null;
      if (useMock) {
        // Mock avec une image plus grande (10x10 rouge) pour tester le redimensionnement
        b64_json = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';
        console.log('🎭 [IMAGE_UPLOAD_SVC] Mock image base64 (10×10)', { 
          postId,
          base64Length: b64_json.length 
        });
        this.loggingService.info('IMAGE_UPLOAD_SVC', '🎭 Mock image base64 pour upload', { postId });
      } else {
        console.log('🖼️ [IMAGE_UPLOAD_SVC] Génération DALL-E...', { phraseAccroche });
        b64_json = await this.openaiApiService.imageGeneratorUrl(this.getPromptsService.getOpenAiPromptImageGenerator(phraseAccroche)) || null;
        console.log('🖼️ [IMAGE_UPLOAD_SVC] DALL-E résultat:', { 
          success: !!b64_json,
          base64Length: b64_json?.length 
        });
      }

      if (!b64_json) {
        console.error('❌ [IMAGE_UPLOAD_SVC] Pas d\'image générée');
        this.loggingService.warn('IMAGE_UPLOAD_SVC', '⚠️ Pas d\'image générée');
        return 'https://via.placeholder.com/800x400/666/white?text=Aucune+Image+Generee';
      }

      try {
        // Étape 2 : Traiter l'image (400×400, WebP, max 200Ko)
        console.log('🎨 [IMAGE_UPLOAD_SVC] ===== TRAITEMENT IMAGE (400×400, WebP, max 200Ko) =====');
        this.loggingService.info('IMAGE_UPLOAD_SVC', '🎨 Traitement image principale (400×400, WebP, max 200Ko)');
        
        const processedImageData = await this.imageProcessingService.processImageForMainPost(b64_json);
        
        console.log('✅ [IMAGE_UPLOAD_SVC] Image traitée:', { 
          tailleFinale: `${(processedImageData.length / 1024).toFixed(2)} Ko`,
          bytes: processedImageData.length
        });

        // Étape 3 : Upload temporaire dans Supabase Storage
        const timestamp = Date.now();
        const tempFilename = `temp_${postId}_${timestamp}.webp`;
        console.log('📤 [IMAGE_UPLOAD_SVC] ===== UPLOAD TEMPORAIRE VERS SUPABASE =====', { tempFilename });
        this.loggingService.info('IMAGE_UPLOAD_SVC', '📤 Upload temporaire image', { tempFilename });
        
        const tempImageUrl = await this.supabaseService.uploadProcessedImageToStorage(postId, processedImageData, tempFilename);

        if (!tempImageUrl) {
          console.error('❌ [IMAGE_UPLOAD_SVC] Upload temporaire échoué - URL null');
          this.loggingService.warn('IMAGE_UPLOAD_SVC', '⚠️ Upload temporaire échoué - fallback');
          return 'https://via.placeholder.com/400x400/4caf50/white?text=Image+Jardin+Iris';
        }

        console.log('✅ [IMAGE_UPLOAD_SVC] Image temporaire uploadée:', { tempImageUrl });

        // Étape 4 : Générer description SEO avec l'URL publique Supabase
        console.log('🔍 [IMAGE_UPLOAD_SVC] ===== GÉNÉRATION DESCRIPTION SEO =====');
        this.loggingService.info('IMAGE_UPLOAD_SVC', '🔍 Génération description SEO avec OpenAI Vision', { tempImageUrl });
        
        const seoFilename = await this.imageDescriptionService.generateMainImageFilename(postId, tempImageUrl);
        
        console.log('✅ [IMAGE_UPLOAD_SVC] Nom fichier SEO généré:', seoFilename);

        // Étape 5 : Re-uploader l'image avec le nom SEO final (on garde processedImageData en mémoire)
        console.log('📤 [IMAGE_UPLOAD_SVC] ===== RE-UPLOAD AVEC NOM SEO =====');
        this.loggingService.info('IMAGE_UPLOAD_SVC', '📤 Re-upload image avec nom SEO', { seoFilename });
        
        const finalImageUrl = await this.supabaseService.uploadProcessedImageToStorage(postId, processedImageData, seoFilename);
        
        if (!finalImageUrl) {
          console.warn('⚠️ [IMAGE_UPLOAD_SVC] Re-upload échoué, on utilise l\'URL temporaire');
          this.loggingService.warn('IMAGE_UPLOAD_SVC', '⚠️ Re-upload échoué, utilisation URL temporaire');
        }

        const finalUrl = finalImageUrl || tempImageUrl;
        
        console.log('✅ [IMAGE_UPLOAD_SVC] URL finale:', { 
          finalUrl,
          hasSeoName: !!finalImageUrl
        });

        // Étape 6 : Mettre à jour l'URL dans la table post
        console.log('💾 [IMAGE_UPLOAD_SVC] Mise à jour DB...');
        await this.supabaseService.updateImageUrlPostByIdForm(postId, finalUrl);
        
        console.log('🎉 [IMAGE_UPLOAD_SVC] ===== SUCCÈS COMPLET ===== ', {
          postId,
          imageUrl: finalUrl,
          seoFilename,
          hasSeoName: !!finalImageUrl,
          format: 'WebP',
          dimensions: '400×400',
          taille: `${(processedImageData.length / 1024).toFixed(2)} Ko`,
          note: 'Fichier temporaire conservé pour nettoyage manuel'
        });
        
        this.loggingService.info('IMAGE_UPLOAD_SVC', '✅ Upload image principale OK', {
          postId,
          imageUrl: finalUrl,
          seoFilename,
          hasSeoName: !!finalImageUrl,
          format: 'WebP',
          dimensions: '400×400'
        });

        return finalUrl;
      } catch (error) {
        console.error('💥 [IMAGE_UPLOAD_SVC] ERREUR DÉTECTÉE:', error);
        this.loggingService.error('IMAGE_UPLOAD_SVC', '❌ Erreur upload image principale', error);
        
        // Fallback : tenter l'ancienne méthode sans traitement
        console.warn('⚠️ [IMAGE_UPLOAD_SVC] Tentative FALLBACK (sans traitement)...');
        this.loggingService.warn('IMAGE_UPLOAD_SVC', '⚠️ Tentative fallback sans traitement');
        try {
          const fallbackUrl = await this.supabaseService.uploadBase64ToSupabase(postId, b64_json);
          if (fallbackUrl) {
            await this.supabaseService.updateImageUrlPostByIdForm(postId, fallbackUrl);
            console.log('✅ [IMAGE_UPLOAD_SVC] Fallback réussi (PNG non optimisé)', { fallbackUrl });
            this.loggingService.info('IMAGE_UPLOAD_SVC', '✅ Fallback réussi (image non optimisée)');
            return fallbackUrl;
          }
        } catch (fallbackError) {
          console.error('💥 [IMAGE_UPLOAD_SVC] Fallback échoué:', fallbackError);
          this.loggingService.error('IMAGE_UPLOAD_SVC', '❌ Fallback échoué', fallbackError);
        }
        
        return 'https://via.placeholder.com/400x400/4caf50/white?text=Image+Non+Disponible';
      }
    })());
  }
}


