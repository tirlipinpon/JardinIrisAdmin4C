import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { environment } from '@env';
import { SearchStore } from '@jardin-iris/feature/create';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private injector?: Injector;

  constructor(private injectorParam?: Injector) {
    this.injector = injectorParam;
  }

  handleError(error: any): void {
    // Log immédiat dans la console pour le développement
    console.error('🚨 Erreur Globale Capturée:', error);
    
    // Essayer d'utiliser les services si disponibles
    this.tryLogError(error);
    this.tryAddToStore(error);

    // Optionnel : Afficher une notification console pour le développement
    if (!environment.production) {
      console.group('🚨 Erreur Globale Capturée');
      console.error('Message:', error?.message || 'Erreur inconnue');
      console.error('Stack:', error?.stack);
      console.error('Erreur complète:', error);
      console.groupEnd();
    }
  }

  private tryLogError(error: any): void {
    try {
      if (this.injector) {
        const loggingService = this.injector.get(LoggingService, null);
        if (loggingService) {
          loggingService.error('GLOBAL_ERROR_HANDLER', '❌ Erreur globale capturée', {
            error: error,
            message: error?.message || 'Erreur inconnue',
            stack: error?.stack || 'Pas de stack trace disponible',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          });
        }
      }
    } catch (logError) {
      console.error('GLOBAL_ERROR_HANDLER - Erreur lors du logging:', logError);
    }
  }

  private tryAddToStore(error: any): void {
    try {
      if (this.injector) {
        const store = this.injector.get(SearchStore, null);
        if (store && typeof store.addError === 'function') {
          const errorMessage = this.formatErrorMessage(error);
          store.addError(errorMessage);
        }
      }
    } catch (storeError) {
      console.error('GLOBAL_ERROR_HANDLER - Erreur lors de l\'ajout au store:', storeError);
    }
  }


  private formatErrorMessage(error: any): string {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    
    if (error instanceof Error) {
      return `[${timestamp}] ${error.name}: ${error.message}`;
    }
    
    if (typeof error === 'string') {
      return `[${timestamp}] ${error}`;
    }
    
    if (error && typeof error === 'object') {
      const message = error.message || error.error?.message || 'Erreur inconnue';
      const name = error.name || error.constructor?.name || 'Error';
      return `[${timestamp}] ${name}: ${message}`;
    }
    
    return `[${timestamp}] Erreur inconnue: ${String(error)}`;
  }
}
