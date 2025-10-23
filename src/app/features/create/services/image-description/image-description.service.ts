import { inject, Injectable } from '@angular/core';
import { LoggingService } from '../../../../shared/services/logging.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { formatToSeoSlug } from '../../../../shared/utils/text-formatting.utils';

@Injectable({ providedIn: 'root' })
export class ImageDescriptionService {
  private readonly loggingService = inject(LoggingService);
  private readonly openaiApiService = inject(OpenaiApiService);

  /**
   * Génère une description SEO d'une image en utilisant OpenAI Vision API
   * @param imageUrl URL de l'image à analyser
   * @returns Description SEO formatée en slug (ex: "jardin-fleurs-roses-printemps")
   */
  async generateSeoDescription(imageUrl: string): Promise<string> {
    try {
      this.loggingService.info('IMAGE_DESCRIPTION_SVC', '🔍 Analyse image avec OpenAI Vision', { imageUrl });

      // Appel à l'API OpenAI Vision pour décrire l'image
      const description = await this.openaiApiService.describeImage(imageUrl);

      if (!description) {
        this.loggingService.warn('IMAGE_DESCRIPTION_SVC', '⚠️ Pas de description reçue, utilisation du fallback');
        return this.generateFallbackDescription();
      }

      // Formater la description en slug SEO
      const seoSlug = formatToSeoSlug(description);
      
      this.loggingService.info('IMAGE_DESCRIPTION_SVC', '✅ Description SEO générée', { 
        description, 
        seoSlug 
      });

      return seoSlug;
    } catch (error) {
      this.loggingService.error('IMAGE_DESCRIPTION_SVC', '❌ Erreur génération description', error);
      return this.generateFallbackDescription();
    }
  }


  /**
   * Génère une description de fallback en cas d'erreur
   * @returns Description par défaut
   */
  private generateFallbackDescription(): string {
    const timestamp = Date.now();
    return `jardin-image-${timestamp}`;
  }

  /**
   * Génère un nom de fichier SEO pour l'image principale
   * @param postId ID du post (non utilisé dans le nom de fichier)
   * @param imageUrl URL de l'image
   * @returns Nom de fichier formaté: "{description_seo}.webp"
   */
  async generateMainImageFilename(postId: number, imageUrl: string): Promise<string> {
    const description = await this.generateSeoDescription(imageUrl);
    return `${description}.webp`;
  }

  /**
   * Génère un nom de fichier SEO pour une image interne
   * @param postId ID du post (non utilisé dans le nom de fichier)
   * @param chapitreId ID du chapitre (non utilisé dans le nom de fichier)
   * @param imageUrl URL de l'image
   * @returns Nom de fichier formaté: "{description_seo}.webp"
   */
  async generateInternalImageFilename(postId: number, chapitreId: number, imageUrl: string): Promise<string> {
    const description = await this.generateSeoDescription(imageUrl);
    return `${description}.webp`;
  }
}

