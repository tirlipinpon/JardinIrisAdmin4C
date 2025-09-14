import { Injectable, inject } from '@angular/core';
import { PerformanceService, PerformanceMetric } from './performance.service';

@Injectable({
  providedIn: 'root'
})
export class PerformanceInterceptorService {
  private readonly performanceService = inject(PerformanceService);
  private metrics: PerformanceMetric[] = [];

  /**
   * Intercepte et mesure les performances d'une méthode
   */
  intercept<T>(
    methodName: string,
    category: string,
    operation: () => T
  ): T {
    // Utiliser directement le PerformanceService qui gère déjà tout
    return this.performanceService.measure(methodName, category, operation);
  }

  /**
   * Retourne toutes les métriques
   */
  getMetrics(): PerformanceMetric[] {
    return this.performanceService.getMetrics();
  }

  /**
   * Efface toutes les métriques
   */
  clearMetrics(): void {
    this.performanceService.clearMetrics();
  }
}
