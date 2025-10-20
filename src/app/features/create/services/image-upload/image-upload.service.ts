import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { LoggingService } from '../../../../shared/services/logging.service';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { ImageProcessingService } from '../../../../shared/services/image-processing.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly loggingService = inject(LoggingService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly imageProcessingService = inject(ImageProcessingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);

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

        // Étape 3 : Uploader l'image traitée
        console.log('📤 [IMAGE_UPLOAD_SVC] ===== UPLOAD VERS SUPABASE STORAGE =====');
        const imageUrl = await this.supabaseService.uploadProcessedImageToStorage(postId, processedImageData);

        if (!imageUrl) {
          console.error('❌ [IMAGE_UPLOAD_SVC] Upload échoué - URL null');
          this.loggingService.warn('IMAGE_UPLOAD_SVC', '⚠️ Upload échoué - fallback');
          return 'https://via.placeholder.com/400x400/4caf50/white?text=Image+Jardin+Iris';
        }

        console.log('✅ [IMAGE_UPLOAD_SVC] Image uploadée:', { imageUrl });

        // Étape 4 : Mettre à jour l'URL dans la table post
        console.log('💾 [IMAGE_UPLOAD_SVC] Mise à jour DB...');
        await this.supabaseService.updateImageUrlPostByIdForm(postId, imageUrl);
        
        console.log('🎉 [IMAGE_UPLOAD_SVC] ===== SUCCÈS COMPLET ===== ', {
          postId,
          imageUrl,
          format: 'WebP',
          dimensions: '400×400',
          taille: `${(processedImageData.length / 1024).toFixed(2)} Ko`
        });
        
        this.loggingService.info('IMAGE_UPLOAD_SVC', '✅ Upload image principale OK', {
          postId,
          imageUrl,
          format: 'WebP',
          dimensions: '400×400'
        });

        return imageUrl;
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


