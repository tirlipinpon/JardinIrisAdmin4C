import { inject, Injectable } from '@angular/core';
import { Observable, from, of, concatMap, switchMap, toArray, map, catchError } from 'rxjs';
import { LoggingService } from '../../../../shared/services/logging.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { PexelsApiService } from '../pexels-api/pexels-api.service';
import { InternalImageData } from '../../types/internalImageData';
import { environment } from '../../../../../environments/environment';
import { extractJSONBlock } from '../../utils/cleanJsonObject';

@Injectable({ providedIn: 'root' })
export class InternalImageService {
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);
  private readonly pexelsApiService = inject(PexelsApiService);

  generateInternalImages(
    article: string,
    postId: number,
    warningCallback?: (message: string) => void
  ): Observable<{ article: string; images: InternalImageData[] }> {
    this.loggingService.info('INTERNAL_IMAGE_SVC', '🔧 Début generation', { articleLength: article.length, postId });

    const chapterIds = Array.from({ length: environment.globalNbChapter }, (_, i) => i + 1);
    const usedKeywords: string[] = [];

    return from(chapterIds).pipe(
      concatMap((chapitreId: number) => {
        this.loggingService.info('INTERNAL_IMAGE_SVC', `🔧 Chapitre ${chapitreId}/${environment.globalNbChapter}`);

        const paragraphRegex = new RegExp(`<span id=['"]paragraphe-${chapitreId}['"][^>]*>(.*?)</span>`, 's');
        const paragraphMatch = article.match(paragraphRegex);
        if (!paragraphMatch) {
          this.loggingService.warn('INTERNAL_IMAGE_SVC', `Paragraphe ${chapitreId} non trouvé`);
          return of(null);
        }

        const paragraphContent = paragraphMatch[1];
        const h4Regex = /<h4[^>]*>(.*?)<\/h4>/;
        const h4Match = paragraphContent.match(h4Regex);
        if (!h4Match) {
          this.loggingService.warn('INTERNAL_IMAGE_SVC', `Aucun <h4> au chapitre ${chapitreId}`);
          return of(null);
        }

        const h4Content = h4Match[1];
        const keywordPrompt = this.getPromptsService.getPromptGenericSelectKeyWordsFromChapitresInArticle(h4Content, usedKeywords);

        return from(this.openaiApiService.fetchData(keywordPrompt, true, 'internalImage')).pipe(
          switchMap(keywordResult => {
            if (!keywordResult) {
              this.loggingService.warn('INTERNAL_IMAGE_SVC', `Aucun mot-clé pour ${chapitreId}`);
              return of(null);
            }
            try {
              const keywordData: { keyWord: string; explanation: string } = JSON.parse(extractJSONBlock(keywordResult));
              const keyword = keywordData.keyWord;
              const explanation = keywordData.explanation;
              if (!keyword || usedKeywords.includes(keyword)) {
                this.loggingService.warn('INTERNAL_IMAGE_SVC', `Mot-clé invalide/dupliqué: ${keyword}`);
                return of(null);
              }
              usedKeywords.push(keyword);
              return this.pexelsApiService.searchImages(keyword, 5).pipe(
                switchMap(images => {
                  if (!images.length) {
                    this.loggingService.warn('INTERNAL_IMAGE_SVC', `Aucune image Pexels: ${keyword}`);
                    return of(null);
                  }
                  const imageUrls = images.map(img => img.src.medium);
                  const visionPrompt = this.getPromptsService.getPromptGenericSelectBestImageForChapitresInArticleWithVision(paragraphContent, imageUrls);
                  return from(this.openaiApiService.fetchDataImage(visionPrompt, imageUrls, 'internalImageVision')).pipe(
                    map(visionResult => {
                      try {
                        const selection: { imageUrl: string } = JSON.parse(extractJSONBlock(visionResult));
                        
                        // Vérifier si l'URL est vide (fallback)
                        if (!selection.imageUrl) {
                          this.loggingService.warn('INTERNAL_IMAGE_SVC', `Image selection fallback pour chapitre ${chapitreId}`);
                          warningCallback?.(`Image non disponible pour chapitre ${chapitreId} - utilisation placeholder`);
                          return {
                            chapitre_id: chapitreId,
                            chapitre_key_word: keyword,
                            url_Image: this.generatePlaceholderUrl(keyword),
                            explanation_word: explanation
                          } as InternalImageData;
                        }
                        
                        const selected = images.find(img => img.src.medium === selection.imageUrl);
                        if (!selected) {
                          this.loggingService.warn('INTERNAL_IMAGE_SVC', `Image sélectionnée non trouvée pour chapitre ${chapitreId}`);
                          return {
                            chapitre_id: chapitreId,
                            chapitre_key_word: keyword,
                            url_Image: this.generatePlaceholderUrl(keyword),
                            explanation_word: explanation
                          } as InternalImageData;
                        }
                        
                        return {
                          chapitre_id: chapitreId,
                          chapitre_key_word: keyword,
                          url_Image: selected.src.large,
                          explanation_word: explanation
                        } as InternalImageData;
                      } catch (error) {
                        this.loggingService.error('INTERNAL_IMAGE_SVC', `Erreur parsing sélection image chapitre ${chapitreId}`, error);
                        warningCallback?.(`Erreur parsing sélection image chapitre ${chapitreId}`);
                        return {
                          chapitre_id: chapitreId,
                          chapitre_key_word: keyword,
                          url_Image: this.generatePlaceholderUrl(keyword),
                          explanation_word: explanation
                        } as InternalImageData;
                      }
                    }),
                    catchError(error => {
                      this.loggingService.error('INTERNAL_IMAGE_SVC', `Erreur OpenAI Vision pour chapitre ${chapitreId}`, error);
                      warningCallback?.(`Erreur analyse image chapitre ${chapitreId} - utilisation placeholder`);
                      return of({
                        chapitre_id: chapitreId,
                        chapitre_key_word: keyword,
                        url_Image: this.generatePlaceholderUrl(keyword),
                        explanation_word: explanation
                      } as InternalImageData);
                    })
                  );
                })
              );
            } catch (error) {
              warningCallback?.(`Erreur parsing mot-clé pour chapitre ${chapitreId}`);
              return of(null);
            }
          })
        );
      }),
      toArray(),
      map(results => {
        const images = (results.filter(Boolean) as InternalImageData[]);
        this.loggingService.info('INTERNAL_IMAGE_SVC', `📨 Terminé: ${images.length}/${environment.globalNbChapter}`);
        return { article, images };
      }),
      catchError(err => {
        warningCallback?.('Erreur globale internalImage');
        this.loggingService.error('INTERNAL_IMAGE_SVC', 'Erreur', err);
        return of({ article, images: [] });
      })
    );
  }

  /**
   * Génère une URL placeholder pour remplacer les images non disponibles
   * @param keyword Mot-clé pour personnaliser le placeholder
   * @returns URL du placeholder
   */
  private generatePlaceholderUrl(keyword: string): string {
    const encodedKeyword = encodeURIComponent(keyword);
    return `https://via.placeholder.com/800x400/4caf50/white?text=${encodedKeyword}`;
  }
}


