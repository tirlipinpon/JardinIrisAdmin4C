import { Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorTestService {
  private readonly loggingService = inject(LoggingService);

  constructor() {}

  /**
   * Teste différents types d'erreurs pour vérifier la gestion globale
   */
  testGlobalErrorHandling(): void {
    this.loggingService.info('ERROR_TEST_SERVICE', '🧪 Démarrage des tests de gestion d\'erreur globale');

    // Test 1: Erreur JavaScript classique
    setTimeout(() => {
      try {
        throw new Error('Test d\'erreur JavaScript - Gestion globale');
      } catch (error) {
        // Cette erreur sera capturée par le GlobalErrorHandler
        throw error;
      }
    }, 1000);

    // Test 2: Erreur de promesse non gérée
    setTimeout(() => {
      Promise.reject(new Error('Test d\'erreur de promesse - Gestion globale'));
    }, 2000);

    // Test 3: Erreur de référence
    setTimeout(() => {
      try {
        // @ts-ignore - Intentionnel pour tester
        console.log(nonExistentVariable);
      } catch (error) {
        throw error;
      }
    }, 3000);

    // Test 4: Erreur de type
    setTimeout(() => {
      try {
        // @ts-ignore - Intentionnel pour tester
        const result = null.someProperty;
        console.log(result);
      } catch (error) {
        throw error;
      }
    }, 4000);

    // Test 5: Erreur de réseau simulée
    setTimeout(() => {
      try {
        throw new Error('Test d\'erreur de réseau simulée - Gestion globale');
      } catch (error) {
        throw error;
      }
    }, 5000);

    this.loggingService.info('ERROR_TEST_SERVICE', '✅ Tests d\'erreur programmés - Vérifiez les erreurs dans le store');
  }

  /**
   * Teste une erreur synchrone
   */
  testSynchronousError(): void {
    this.loggingService.info('ERROR_TEST_SERVICE', '🧪 Test d\'erreur synchrone');
    throw new Error('Test d\'erreur synchrone - Gestion globale');
  }

  /**
   * Teste une erreur asynchrone
   */
  testAsynchronousError(): void {
    this.loggingService.info('ERROR_TEST_SERVICE', '🧪 Test d\'erreur asynchrone');
    setTimeout(() => {
      throw new Error('Test d\'erreur asynchrone - Gestion globale');
    }, 100);
  }

  /**
   * Teste une erreur de promesse
   */
  testPromiseError(): void {
    this.loggingService.info('ERROR_TEST_SERVICE', '🧪 Test d\'erreur de promesse');
    Promise.reject(new Error('Test d\'erreur de promesse - Gestion globale'));
  }
}
