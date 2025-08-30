import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap, concatMap, tap } from 'rxjs';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { LoggingService } from '../../../../shared/services/logging.service';
import { OpenaiApiService } from '../../services/openai-api/openai-api.service';
import { GoogleSearchService, VideoInfo } from '../../services/google-search/google-search.service';
import { PexelsApiService, PexelsImage } from '../../services/pexels-api/pexels-api.service';
import { parseJsonSafe, extractJSONBlock } from '../../utils/cleanJsonObject';
import { Post } from '../../types/post';
import { GetPromptsService } from '../../services/get-prompts/get-prompts.service';


@Injectable({
  providedIn: 'root'
})
export class Infrastructure {
  private readonly supabaseService = inject(SupabaseService);
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);
  private readonly googleSearchService = inject(GoogleSearchService);
  private readonly pexelsApiService = inject(PexelsApiService);

  getNextPostId(): Observable<number | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Impossible de récupérer le prochain ID de post',
        details: 'Simulation d\'une erreur Postgrest pour tester la gestion d\'erreur',
        hint: 'Vérifiez la connexion à la base de données',
        code: 'TEST_ERROR_001',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée', mockError);
      return from(Promise.resolve(mockError));
    }
    if (shouldReturnMock) { 
      const dummyNextPostId = 666;
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data', { postId: dummyNextPostId });
      return from(Promise.resolve(dummyNextPostId));
    }
  
    return from(this.supabaseService.getNextPostId());
    
  }

  getLastPostTitreAndId(): Observable<{ titre: string; id: number; new_href: string }[] | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début getLastPostTitreAndId()');
    return from(this.supabaseService.getLastPostTitreAndId(10));
  }

  setPost(articleIdea: string): Observable<Post | PostgrestError> {
    const prompt = this.getPromptsService.generateArticle(articleIdea);
    return from(this.openaiApiService.fetchData(prompt, false)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        return parseJsonSafe(extractJSONBlock(result));
      })
    );
  }

  setImageUrl(phraseAccroche: string, postId: number): Observable<string | PostgrestError> {
    return from((async () => {
      // 1️⃣ Générer l'image en base64
      const b64_json = await this.openaiApiService.imageGeneratorUrl(this.getPromptsService.getOpenAiPromptImageGenerator(phraseAccroche));
      // 2️⃣ Convertir le base64 en Blob
      if (b64_json) {
        // 3️⃣ Uploader le Blob dans Supabase Storage
        const imageUrl = await this.supabaseService.uploadBase64ToSupabase(postId, b64_json);
        if (!imageUrl) {
          throw new Error('Échec de l\'upload de l\'image vers Supabase');
        }
        // 4️⃣ Mettre à jour le post avec l'URL publique
        await this.supabaseService.updateImageUrlPostByIdForm(postId, imageUrl);
        return imageUrl;
      }
      throw new Error('Échec de la génération de l\'image par OpenAI');
    })());
  }

  setVideo(phrase_accroche: string, postId: number): Observable<string | PostgrestError> {
    const prompt = this.getPromptsService.generateKeyWordForSearchVideo(phrase_accroche);
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      switchMap(result => {
        if (!result) return of('');
        try {
          const keywordData: { keywords: string } = JSON.parse(extractJSONBlock(result));
          const keywords = keywordData.keywords;
          if (!keywords) return of('');
          return this.googleSearchService.searchFrenchVideo(keywords).pipe(
            switchMap((videoUrls: VideoInfo[]) => {
              if (!videoUrls.length) return of('');
              const videoPrompt = this.getPromptsService.searchVideoFromYoutubeResult(phrase_accroche, videoUrls);
              return from(this.openaiApiService.fetchData(videoPrompt, true)).pipe(
                switchMap(videoResult => {
                  const videoData: { video: string } = JSON.parse(extractJSONBlock(videoResult));
                  const videoUrl = videoData.video && videoData.video.length ? videoData.video : null;
                  return videoUrl ? of(videoUrl) : of('');
                })
              );
            })
          );
        } catch (error) {
          this.loggingService.error('INFRASTRUCTURE', 'Erreur lors du parsing du keyword', error);
          return of('');
        }
      })
    );
  }

  setFaq(article: string): Observable<{ question: string; response: string }[] | PostgrestError> {
    const prompt = this.getPromptsService.getPromptFaq(article);
      return from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI');
          }
          const data: {question: string; response: string}[]  = JSON.parse(extractJSONBlock(result))
          // TODO: Utiliser postId pour sauvegarder la FAQ dans Supabase
          return data;
        })
      );
  }

  internalImage(article: string): Observable<string | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début internalImage()', { articleLength: article.length, titre: titre });
    
    // Extraire les paragraphes de l'article pour traiter chacun séparément
    const paragraphMatches = article.match(/<span id="paragraphe-(\d+)">/g);
    if (!paragraphMatches) {
      this.loggingService.warn('INFRASTRUCTURE', 'Aucun paragraphe trouvé dans l\'article pour les images internes');
      return of(article);
    }

    // Traiter chaque paragraphe séquentiellement pour ajouter des images
    let upgradedArticle = article;
    const paragraphIds = paragraphMatches.map(match => {
      const idMatch = match.match(/paragraphe-(\d+)/);
      return idMatch ? parseInt(idMatch[1]) : 0;
    });

    const usedKeywords: string[] = []; // Pour éviter la duplication des mots-clés

    return from(paragraphIds).pipe(
      concatMap((paragrapheId: number) => {
        // Extraire le contenu du paragraphe spécifique
        const paragraphRegex = new RegExp(`<span id="paragraphe-${paragrapheId}">(.*?)</span>`, 's');
        const paragraphMatch = upgradedArticle.match(paragraphRegex);
        
        if (!paragraphMatch) {
          this.loggingService.warn('INFRASTRUCTURE', `Paragraphe ${paragrapheId} non trouvé pour les images`);
          return of(upgradedArticle);
        }

        const paragraphContent = paragraphMatch[1];
        
        // 1️⃣ Générer un mot-clé pour ce paragraphe
        const keywordPrompt = this.getPromptsService.getPromptGenericSelectKeyWordsFromChapitresInArticle(titre, usedKeywords);
        
        return from(this.openaiApiService.fetchData(keywordPrompt, true)).pipe(
          switchMap(keywordResult => {
            if (!keywordResult) {
              this.loggingService.warn('INFRASTRUCTURE', `Aucun mot-clé généré pour le paragraphe ${paragrapheId}`);
              return of(upgradedArticle);
            }
            
            try {
              const keywordData: { keyWord: string; explanation: string } = JSON.parse(extractJSONBlock(keywordResult));
              const keyword = keywordData.keyWord;
              
              if (!keyword || usedKeywords.includes(keyword)) {
                this.loggingService.warn('INFRASTRUCTURE', `Mot-clé invalide ou déjà utilisé: ${keyword}`);
                return of(upgradedArticle);
              }
              
              usedKeywords.push(keyword);
              this.loggingService.info('INFRASTRUCTURE', `Mot-clé généré pour paragraphe ${paragrapheId}: ${keyword}`);
              
              // 2️⃣ Rechercher des images avec ce mot-clé
              return this.pexelsApiService.searchImages(keyword, 5).pipe(
                switchMap((images: PexelsImage[]) => {
                  if (!images.length) {
                    this.loggingService.warn('INFRASTRUCTURE', `Aucune image trouvée pour le mot-clé: ${keyword}`);
                    return of(upgradedArticle);
                  }
                  
                  // 3️⃣ Utiliser l'IA pour choisir la meilleure image
                  const imageUrls = images.map(img => img.src.medium);
                  const visionPrompt = this.getPromptsService.getPromptGenericSelectBestImageForChapitresInArticleWithVision(paragraphContent, imageUrls);
                  
                  return from(this.openaiApiService.fetchDataImage(visionPrompt, imageUrls)).pipe(
                    map(visionResult => {
                      if (!visionResult) {
                        this.loggingService.warn('INFRASTRUCTURE', `Aucune sélection d'image pour le paragraphe ${paragrapheId}`);
                        return upgradedArticle;
                      }
                      
                      try {
                        const imageSelection: { imageUrl: string } = JSON.parse(extractJSONBlock(visionResult));
                        const selectedImageUrl = imageSelection.imageUrl;
                        
                        if (selectedImageUrl && imageUrls.includes(selectedImageUrl)) {
                          // Trouver l'image complète correspondante
                          const selectedImage = images.find(img => img.src.medium === selectedImageUrl);
                          if (selectedImage) {
                            // 4️⃣ Insérer l'image dans le paragraphe
                            const imageHtml = `<div class="internal-image"><img src="${selectedImage.src.large}" alt="${selectedImage.alt || keyword}" loading="lazy" /><span class="image-credit">Photo par <a href="${selectedImage.photographer_url}" target="_blank">${selectedImage.photographer}</a> sur Pexels</span></div>`;
                            
                            // Insérer l'image après le titre du paragraphe
                            const updatedParagraph = paragraphContent.replace(
                              /(<h4>.*?<\/h4>)/,
                              `$1${imageHtml}`
                            );
                            
                            upgradedArticle = upgradedArticle.replace(
                              paragraphRegex,
                              `<span id="paragraphe-${paragrapheId}">${updatedParagraph}</span>`
                            );
                            
                            this.loggingService.info('INFRASTRUCTURE', `Image ajoutée au paragraphe ${paragrapheId}: ${selectedImage.alt}`);
                          }
                        }
                        
                        return upgradedArticle;
                      } catch (error) {
                        this.loggingService.error('INFRASTRUCTURE', `Erreur parsing sélection image paragraphe ${paragrapheId}`, error);
                        return upgradedArticle;
                      }
                    })
                  );
                })
              );
            } catch (error) {
              this.loggingService.error('INFRASTRUCTURE', `Erreur parsing mot-clé paragraphe ${paragrapheId}`, error);
              return of(upgradedArticle);
            }
          })
        );
      }),
      // Retourner le dernier état de l'article après traitement de tous les paragraphes
      map(() => upgradedArticle),
      tap((finalArticle: string) => {
        this.loggingService.info('INFRASTRUCTURE', '📨 Réponse internalImage complète', { 
          originalLength: article.length, 
          finalLength: finalArticle.length,
          keywordsUsed: usedKeywords.length
        });
      })
    );
  }

  setInternalLink(article: string, postTitreAndId: { titre: string; id: number; new_href: string }[]): Observable<string | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début setInternalLink()', { articleLength: article.length, postsCount: postTitreAndId.length });
    
    const prompt = this.getPromptsService.addInternalLinkInArticle(article, postTitreAndId);
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI pour les liens internes');
        }
        
        try {
          const data: { upgraded: string; idToRemove?: string } = JSON.parse(extractJSONBlock(result));
          this.loggingService.info('INFRASTRUCTURE', '📨 Réponse setInternalLink', { hasUpgraded: !!data.upgraded, idToRemove: data.idToRemove });
          return data.upgraded;
        } catch (error) {
          this.loggingService.error('INFRASTRUCTURE', 'Erreur lors du parsing du résultat setInternalLink', error);
          throw new Error('Erreur lors du parsing du résultat des liens internes');
        }
      })
    );
  }

  vegetal(article: string): Observable<string | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début vegetal()', { articleLength: article.length });
    
    // Extraire les paragraphes de l'article pour traiter chacun séparément
    const paragraphMatches = article.match(/<span id="paragraphe-(\d+)">/g);
    if (!paragraphMatches) {
      this.loggingService.warn('INFRASTRUCTURE', 'Aucun paragraphe trouvé dans l\'article');
      return of(article);
    }

    // Traiter chaque paragraphe séquentiellement
    let upgradedArticle = article;
    const paragraphIds = paragraphMatches.map(match => {
      const idMatch = match.match(/paragraphe-(\d+)/);
      return idMatch ? parseInt(idMatch[1]) : 0;
    });

    return from(paragraphIds).pipe(
      concatMap((paragrapheId: number) => {
        // Extraire le contenu du paragraphe spécifique
        const paragraphRegex = new RegExp(`<span id="paragraphe-${paragrapheId}">(.*?)</span>`, 's');
        const paragraphMatch = upgradedArticle.match(paragraphRegex);
        
        if (!paragraphMatch) {
          this.loggingService.warn('INFRASTRUCTURE', `Paragraphe ${paragrapheId} non trouvé`);
          return of(upgradedArticle);
        }

        const paragraphContent = paragraphMatch[1];
        const prompt = this.getPromptsService.getPromptAddVegetalInArticle(paragraphContent, paragrapheId);
        
        return from(this.openaiApiService.fetchData(prompt, true)).pipe(
          map(result => {
            if (result === null) {
              this.loggingService.warn('INFRASTRUCTURE', `Aucun résultat pour le paragraphe ${paragrapheId}`);
              return upgradedArticle;
            }
            
            try {
              const data: { upgraded: string } = JSON.parse(extractJSONBlock(result));
              if (data.upgraded) {
                // Remplacer le contenu du paragraphe dans l'article complet
                upgradedArticle = upgradedArticle.replace(
                  paragraphRegex,
                  `<span id="paragraphe-${paragrapheId}">${data.upgraded}</span>`
                );
                this.loggingService.info('INFRASTRUCTURE', `Paragraphe ${paragrapheId} traité avec succès`);
              }
              return upgradedArticle;
            } catch (error) {
              this.loggingService.error('INFRASTRUCTURE', `Erreur parsing paragraphe ${paragrapheId}`, error);
              return upgradedArticle;
            }
          })
        );
      }),
      // Retourner le dernier état de l'article après traitement de tous les paragraphes
      map(() => upgradedArticle),
      tap((finalArticle: string) => {
        this.loggingService.info('INFRASTRUCTURE', '📨 Réponse vegetal complète', { 
          originalLength: article.length, 
          finalLength: finalArticle.length 
        });
      })
    );
  }

  
}
