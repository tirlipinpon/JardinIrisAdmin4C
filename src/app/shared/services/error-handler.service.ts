import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, timer } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import {
    AppError,
    AIProviderError,
    DatabaseError,
    ExternalAPIError,
    NetworkError,
    GenericError
} from '../errors/app.error';

/**
 * Service centralisé pour la gestion des erreurs
 * Fonctionne avec tous les types d'appels (SDK, HttpClient, Promise, Observable)
 * 
 * Fonctionnalités :
 * - Retry automatique pour les erreurs temporaires
 * - Logging uniforme de toutes les erreurs
 * - Transformation des erreurs en format standardisé
 * - Mesure du temps d'exécution
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly loggingService = inject(LoggingService);

  /**
   * Wrapper générique pour tous les appels asynchrones
   * Supporte Promise, Observable et fonctions async
   * 
   * @param operation - L'opération à exécuter (peut retourner Promise ou Observable)
   * @param context - Contexte pour le logging (ex: "OpenAI.generateArticle")
   * @param retryConfig - Configuration du retry (optionnel)
   * @returns Observable avec gestion d'erreur complète
   * 
   * @example
   * ```typescript
   * this.errorHandler.wrapWithErrorHandling(
   *   () => this.openaiApi.fetchData(prompt),
   *   'OpenAI.generateArticle',
   *   { maxRetries: 2, retryDelay: 1000 }
   * )
   * ```
   */
  wrapWithErrorHandling<T>(
    operation: () => Promise<T> | Observable<T>,
    context: string,
    retryConfig?: { maxRetries?: number; retryDelay?: number }
  ): Observable<T> {
    const startTime = Date.now();
    const maxRetries = retryConfig?.maxRetries ?? 2;
    const retryDelay = retryConfig?.retryDelay ?? 1000;
    
    this.loggingService.info('ERROR_HANDLER', `🚀 Début opération: ${context}`);
    
    return from(operation()).pipe(
      // Logging du succès
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.loggingService.info('ERROR_HANDLER', `✅ ${context} - Succès en ${duration}ms`);
        }
      }),
      
      // Retry automatique pour les erreurs temporaires
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          if (this.shouldRetry(error)) {
            this.loggingService.warn(
              'ERROR_HANDLER', 
              `🔄 ${context} - Retry ${retryCount}/${maxRetries}`,
              { error: this.extractErrorMessage(error) }
            );
            return timer(retryDelay * retryCount); // Backoff exponentiel
          }
          return throwError(() => error);
        }
      }),
      
      // Gestion d'erreur finale
      catchError((error) => {
        const duration = Date.now() - startTime;
        const appError = this.transformError(error, context);
        
        this.loggingService.error(
          'ERROR_HANDLER', 
          `❌ ${context} - Erreur après ${duration}ms`,
          {
            errorName: appError.name,
            errorMessage: appError.message,
            context: appError.context,
            originalError: error
          }
        );
        
        return throwError(() => appError);
      })
    );
  }

  /**
   * Détermine si une erreur mérite un retry
   * Retry seulement pour les erreurs temporaires (réseau, timeout, 5xx)
   */
  private shouldRetry(error: any): boolean {
    // Erreur réseau (pas de connexion)
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return true;
    }
    
    // Timeout
    if (error?.name === 'TimeoutError') {
      return true;
    }
    
    // Erreur HTTP 5xx (serveur)
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }
    
    // Erreur OpenAI spécifique (rate limit, server error)
    if (error?.error?.type === 'server_error' || error?.error?.type === 'rate_limit_error') {
      return true;
    }
    
    // Erreur Supabase temporaire
    if (error?.code === 'PGRST301' || error?.code === 'PGRST504') {
      return true;
    }
    
    // Autres erreurs : pas de retry
    return false;
  }

  /**
   * Transforme toutes les erreurs en format standardisé AppError
   */
  private transformError(error: any, context: string): AppError {
    // Erreur déjà transformée
    if (error instanceof AppError) {
      return error;
    }
    
    // Erreur OpenAI / DeepSeek / Gemini
    if (error?.error?.message || context.includes('OpenAI') || context.includes('DeepSeek') || context.includes('Gemini')) {
      return new AIProviderError(
        error?.error?.message || error?.message || 'Erreur du provider IA',
        context,
        error
      );
    }
    
    // Erreur Supabase / PostgrestError
    if (error?.code && error?.message && (error?.name === 'PostgrestError' || error?.details)) {
      return new DatabaseError(
        error.message,
        error.code,
        context
      );
    }
    
    // Erreur API externe (YouTube, Pexels, iNaturalist)
    if (context.includes('YouTube') || context.includes('Pexels') || context.includes('iNaturalist')) {
      return new ExternalAPIError(
        error?.message || 'Erreur API externe',
        this.extractAPIName(context),
        error?.status,
        context
      );
    }
    
    // Erreur réseau
    if (error?.name === 'TypeError' || error?.name === 'NetworkError') {
      return new NetworkError(
        error?.message || 'Erreur réseau',
        context
      );
    }
    
    // Erreur générique
    return new GenericError(
      this.extractErrorMessage(error),
      context
    );
  }

  /**
   * Extrait un message d'erreur lisible depuis n'importe quel type d'erreur
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.statusText) {
      return error.statusText;
    }
    
    return 'Erreur inconnue';
  }

  /**
   * Extrait le nom de l'API depuis le contexte
   */
  private extractAPIName(context: string): string {
    if (context.includes('YouTube')) return 'YouTube';
    if (context.includes('Pexels')) return 'Pexels';
    if (context.includes('iNaturalist')) return 'iNaturalist';
    if (context.includes('OpenAI')) return 'OpenAI';
    if (context.includes('DeepSeek')) return 'DeepSeek';
    if (context.includes('Gemini')) return 'Gemini';
    if (context.includes('Supabase')) return 'Supabase';
    return 'Unknown';
  }
}

