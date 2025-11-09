import { Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';
import { SupabaseImageUtils } from '@jardin-iris/shared/util';

export interface InternalImageData {
  chapitre_id: number;
  chapitre_key_word: string;
  url_Image: string;
  explanation_word: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostImageInjectorService {
  private readonly loggingService = inject(LoggingService);
  private readonly supabaseImageUtils = inject(SupabaseImageUtils);

  /**
   * Injecte les images dans le contenu de l'article
   * @param postId ID du post
   * @param articleContent Contenu de l'article
   * @param imagesChapitres Images des chapitres
   * @returns Contenu modifié avec les images injectées
   */
  injectImagesIntoPost(
    postId: number, 
    articleContent: string, 
    imagesChapitres: InternalImageData[]
  ): { content: string; imagesInjected: number } {
    this.loggingService.info('PostImageInjectorService', '🚀 Début de l\'injection d\'images', {
      postId,
      articleContentLength: articleContent.length,
      imagesChapitresCount: imagesChapitres.length,
      imagesChapitres
    });

    let modifiedContent = articleContent;
    let imagesInjected = 0;

    // Traiter chaque chapitre
    for (let i = 1; i <= 5; i++) {
      const imageData = imagesChapitres.find(img => img.chapitre_id === i);
      if (!imageData) {
        this.loggingService.warn('PostImageInjectorService', `Aucune image trouvée pour le chapitre ${i}`);
        continue;
      }

      this.loggingService.info('PostImageInjectorService', `🔍 Traitement du paragraphe ${i}`);

      // Construire la balise img
      const imageTag = this.buildImageTag(imageData, postId);
      
      // Injecter l'image dans le paragraphe
      const result = this.injectImageIntoParagraph(modifiedContent, i, imageTag);
      if (result.success) {
        modifiedContent = result.content;
        imagesInjected++;
        this.loggingService.info('PostImageInjectorService', `✅ Image injectée avec succès dans le chapitre ${i}`, {
          imageUrl: imageData.url_Image,
          altText: imageData.chapitre_key_word,
          keyWord: imageData.chapitre_key_word,
          hasArticle: result.hasArticle,
          contentLength: result.contentLength
        });
      }
    }

    this.loggingService.info('PostImageInjectorService', '📈 Résumé de l\'injection', {
      totalImagesAvailable: imagesChapitres.length,
      imagesInjected,
      imagesSkipped: imagesChapitres.length - imagesInjected,
      successRate: `${Math.round((imagesInjected / imagesChapitres.length) * 100)}%`,
      results: imagesChapitres.map(img => ({
        chapitreId: img.chapitre_id,
        keyWord: img.chapitre_key_word,
        url: img.url_Image
      }))
    });

    this.loggingService.info('PostImageInjectorService', '✅ Contenu modifié avec succès', {
      imagesInjected
    });

    return {
      content: modifiedContent,
      imagesInjected
    };
  }

  /**
   * Construit la balise img pour un chapitre
   */
  private buildImageTag(imageData: InternalImageData, postId: number): string {
    this.loggingService.info('PostImageInjectorService', '🏗️ Construction de la balise img', {
      originalUrl: imageData.url_Image,
      keyWord: imageData.chapitre_key_word,
      isSupabaseUrl: imageData.url_Image.includes('supabase.co')
    });

    // Générer l'URL finale avec le domaine du site
    const finalUrl = this.supabaseImageUtils.generateFinalImageUrl(imageData.url_Image, postId);
    
    // Générer le texte alt
    const altText = this.supabaseImageUtils.generateAltText(imageData.chapitre_key_word, imageData.url_Image);
    
    // Vérifier le format
    const isWebpFormat = imageData.url_Image.toLowerCase().includes('.webp');
    if (!isWebpFormat) {
      this.loggingService.warn('PostImageInjectorService', '⚠️ Format d\'image non-optimisé détecté', {
        url: imageData.url_Image,
        recommendedFormat: 'webp'
      });
    }

    const imageTag = `<img src="${finalUrl}" alt="${altText}" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async">`;

    this.loggingService.info('PostImageInjectorService', '✅ Balise img construite', {
      originalUrl: imageData.url_Image,
      generatedSrc: finalUrl,
      generatedAlt: altText,
      isWebpFormat,
      keyWord: imageData.chapitre_key_word,
      imageTagLength: imageTag.length
    });

    return imageTag;
  }

  /**
   * Injecte une image dans un paragraphe spécifique
   */
  private injectImageIntoParagraph(
    content: string, 
    chapitreId: number, 
    imageTag: string
  ): { success: boolean; content: string; hasArticle: boolean; contentLength: number } {
    const paragraphRegex = new RegExp(`<span id=['"]paragraphe-${chapitreId}['"][^>]*>(.*?)</span>`, 's');
    const match = content.match(paragraphRegex);
    
    if (!match) {
      this.loggingService.warn('PostImageInjectorService', `Paragraphe ${chapitreId} non trouvé`);
      return { success: false, content, hasArticle: false, contentLength: 0 };
    }

    const fullMatch = match[0];
    const paragraphContent = match[1];
    
    // Vérifier si l'image n'est pas déjà présente
    if (paragraphContent.includes('<img')) {
      this.loggingService.info('PostImageInjectorService', `Image déjà présente dans le chapitre ${chapitreId}`);
      return { success: false, content, hasArticle: false, contentLength: paragraphContent.length };
    }

    // Chercher la balise <article> pour placer l'image avant
    const articleRegex = /<article[^>]*>/i;
    const articleMatch = paragraphContent.match(articleRegex);
    
    let newParagraphContent: string;
    let hasArticle = false;
    
    if (articleMatch) {
      // Placer l'image avant <article>
      const articleIndex = paragraphContent.indexOf(articleMatch[0]);
      const beforeArticle = paragraphContent.substring(0, articleIndex);
      const afterArticle = paragraphContent.substring(articleIndex);
      
      newParagraphContent = beforeArticle + imageTag + afterArticle;
      hasArticle = true;
      
      this.loggingService.info('PostImageInjectorService', `📍 Image injectée avant <article> dans le chapitre ${chapitreId}`, {
        articleIndex,
        beforeArticleLength: beforeArticle.length,
        afterArticleLength: afterArticle.length
      });
    } else {
      // Placer l'image à la fin du chapitre
      newParagraphContent = paragraphContent + imageTag;
      
      this.loggingService.info('PostImageInjectorService', `📍 Aucun <article> trouvé, image injectée à la fin du chapitre ${chapitreId}`);
    }

    // Remplacer le contenu du paragraphe
    const newContent = content.replace(fullMatch, fullMatch.replace(paragraphContent, newParagraphContent));
    
    return {
      success: true,
      content: newContent,
      hasArticle,
      contentLength: newParagraphContent.length
    };
  }

  /**
   * Compte le nombre d'images injectées dans le contenu
   */
  countInjectedImages(content: string): number {
    const imageRegex = /<img[^>]*class=['"]randomCropImage['"][^>]*>/gi;
    const matches = content.match(imageRegex);
    const count = matches ? matches.length : 0;
    
    this.loggingService.info('PostImageInjectorService', '🔢 Nombre d\'images injectées détectées', count);
    
    return count;
  }
}
