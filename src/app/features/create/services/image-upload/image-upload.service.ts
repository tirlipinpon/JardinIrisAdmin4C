import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { LoggingService } from '../../../../shared/services/logging.service';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly loggingService = inject(LoggingService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);

  generateAndUploadImage(phraseAccroche: string, postId: number, useMock = false): Observable<string> {
    return from((async () => {
      let b64_json: string | null;
      if (useMock) {
        b64_json = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        this.loggingService.info('IMAGE_UPLOAD_SVC', '🎭 Mock image base64 pour upload', { postId });
      } else {
        b64_json = await this.openaiApiService.imageGeneratorUrl(this.getPromptsService.getOpenAiPromptImageGenerator(phraseAccroche)) || null;
      }
      if (!b64_json) {
        this.loggingService.warn('IMAGE_UPLOAD_SVC', '⚠️ Pas d\'image générée');
        return 'https://via.placeholder.com/800x400/666/white?text=Aucune+Image+Generee';
      }
      try {
        const imageUrl = await this.supabaseService.uploadBase64ToSupabase(postId, b64_json);
        if (!imageUrl) {
          this.loggingService.warn('IMAGE_UPLOAD_SVC', '⚠️ Upload échoué - fallback');
          return 'https://via.placeholder.com/800x400/4caf50/white?text=Image+Jardin+Iris';
        }
        await this.supabaseService.updateImageUrlPostByIdForm(postId, imageUrl);
        this.loggingService.info('IMAGE_UPLOAD_SVC', '🖼️ Upload OK', { postId, imageUrl });
        return imageUrl;
      } catch (error) {
        this.loggingService.error('IMAGE_UPLOAD_SVC', '🚫 Erreur upload', error);
        return 'https://via.placeholder.com/800x400/4caf50/white?text=Image+Non+Disponible';
      }
    })());
  }
}


