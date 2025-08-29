import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { LoggingService } from '../../../../shared/services/logging.service';
import { OpenaiApiService } from '../../services/openai-api/openai-api.service';
import { GoogleSearchService, VideoInfo } from '../../services/google-search/google-search.service';
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

  /**
   * Méthode utilitaire pour appeler OpenAI et traiter le résultat
   */
  private callOpenAI<T>(prompt: any, useJsonMode: boolean, resultProcessor: (result: string) => T): Observable<T | PostgrestError> {
    return from(this.openaiApiService.fetchData(prompt, useJsonMode)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        return resultProcessor(result);
      })
    );
  }

  /**
   * Méthode utilitaire pour parser le JSON depuis une réponse OpenAI
   */
  private parseOpenAIResponse<T>(result: string): T {
    return JSON.parse(extractJSONBlock(result));
  }

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

  setPost(articleIdea: string): Observable<Post | PostgrestError> {
    const prompt = this.getPromptsService.generateArticle(articleIdea);
    return this.callOpenAI(prompt, false, result => parseJsonSafe(extractJSONBlock(result)));
  }

  updateArticle(currentArticle: string): Observable<string | PostgrestError> {
    const prompt = this.getPromptsService.updateArticle(currentArticle);
    return this.callOpenAI(prompt, true, result => {
      const updatedContent = extractJSONBlock(result);
      const parsedResult = JSON.parse(updatedContent);
      return parsedResult.article || updatedContent;
    });
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
    return this.callOpenAI(prompt, true, result => {
      const keywordData: { keywords: string } = this.parseOpenAIResponse(result);
      return keywordData.keywords;
    }).pipe(
      switchMap(keywordsResult => {
        // Vérifier si c'est une erreur PostgrestError
        if (typeof keywordsResult === 'object' && 'message' in keywordsResult) {
          return of(keywordsResult as PostgrestError);
        }
        
        const keywords = keywordsResult as string;
        if (!keywords) return of('');
        
        return this.googleSearchService.searchFrenchVideo(keywords).pipe(
          switchMap((videoUrls: VideoInfo[]) => {
            if (!videoUrls.length) return of('');
            const videoPrompt = this.getPromptsService.searchVideoFromYoutubeResult(phrase_accroche, videoUrls);
            return this.callOpenAI(videoPrompt, true, videoResult => {
              const videoData: { video: string } = this.parseOpenAIResponse(videoResult);
              return videoData.video && videoData.video.length ? videoData.video : '';
            });
          })
        );
      })
    );
  }

  getLastPostTitreAndId(): Observable<{ titre: string; id: number; new_href: string }[] | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début getLastPostTitreAndId()');
    return from(this.supabaseService.getLastPostTitreAndId(10));
  }

  setFaq(article: string): Observable<{ question: string; response: string }[] | PostgrestError> {
    const prompt = this.getPromptsService.getPromptFaq(article);
    return this.callOpenAI(prompt, true, result => {
      const data: { question: string; response: string }[] = this.parseOpenAIResponse(result);
      // TODO: Utiliser postId pour sauvegarder la FAQ dans Supabase
      return data;
    });
  }
}
