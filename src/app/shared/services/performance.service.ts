import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface PerformanceMetric {
  methodName: string;
  duration: number; // en millisecondes
  durationSeconds: number; // en secondes
  timestamp: Date;
  endTime: Date; // timestamp de fin pour le tri
  order: number; // numéro d'ordre basé sur l'ordre de fin
  category: string;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100; // Garder seulement les 100 dernières mesures
  private orderCounter = 0; // Compteur pour l'ordre de fin

  /**
   * Mesure le temps d'exécution d'une méthode
   */
  measure<T>(
    methodName: string,
    category: string,
    operation: () => T
  ): T {
    const startTime = performance.now();
    const timestamp = new Date();

    try {
      const result = operation();
      
      // If the result is an Observable, we need to tap into its stream
      if (result instanceof Observable) {
        return result.pipe(
          tap(() => {
            const duration = performance.now() - startTime;
            this.recordMetric(methodName, category, duration, timestamp, true);
          }),
          catchError((error) => {
            const duration = performance.now() - startTime;
            this.recordMetric(methodName, category, duration, timestamp, false, (error as Error).message);
            throw error;
          })
        ) as T;
      } else if (result instanceof Promise) {
        // If the result is a Promise, we need to handle its resolution
        result.then(
          () => {
            const duration = performance.now() - startTime;
            this.recordMetric(methodName, category, duration, timestamp, true);
          },
          (error) => {
            const duration = performance.now() - startTime;
            this.recordMetric(methodName, category, duration, timestamp, false, (error as Error).message);
          }
        );
        return result; // Return the promise directly
      } else {
        // Handle synchronous operations
        const duration = performance.now() - startTime;
        this.recordMetric(methodName, category, duration, timestamp, true);
        return result;
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(methodName, category, duration, timestamp, false, (error as Error).message);
      throw error;
    }
  }

  /**
   * Enregistre une métrique
   */
  private recordMetric(
    methodName: string,
    category: string,
    duration: number,
    timestamp: Date,
    success: boolean,
    error?: string
  ): void {
    const endTime = new Date();
    const durationSeconds = duration / 1000; // Conversion en secondes
    this.orderCounter++; // Incrémenter le compteur d'ordre
    
    const metric: PerformanceMetric = {
      methodName,
      duration,
      durationSeconds,
      timestamp,
      endTime,
      order: this.orderCounter,
      category,
      success,
      error
    };

    this.metrics.push(metric);
    
    // Garder seulement les dernières métriques
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Afficher le résultat
    this.logMetric(metric);
  }

  /**
   * Affiche une métrique dans la console
   */
  private logMetric(metric: PerformanceMetric): void {
    const { methodName, duration, durationSeconds, category, success, error, order } = metric;
    
    const statusIcon = success ? '✅' : '❌';
    const durationFormatted = duration.toFixed(2);
    const durationSecondsFormatted = durationSeconds.toFixed(3);
    const categoryColor = this.getCategoryColor(category);
    
    console.group(`${statusIcon} #${order} ${categoryColor}${category}${this.resetColor()} - ${methodName}`);
    console.log(`⏱️  Durée: ${durationFormatted}ms (${durationSecondsFormatted}s)`);
    console.log(`🕐 Timestamp: ${metric.timestamp.toLocaleTimeString()}`);
    console.log(`🔢 Ordre de fin: ${order}`);
    
    if (!success && error) {
      console.error(`❌ Erreur: ${error}`);
    }
    
    console.groupEnd();
  }

  /**
   * Retourne la couleur pour une catégorie
   */
  private getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Database': '\x1b[34m',      // Bleu
      'API External': '\x1b[33m',   // Jaune
      'Image Processing': '\x1b[35m', // Magenta
      'Video Processing': '\x1b[36m', // Cyan
      'Text Processing': '\x1b[32m',  // Vert
      'File Upload': '\x1b[31m',     // Rouge
      'Default': '\x1b[37m'          // Blanc
    };
    
    return colors[category] || colors['Default'];
  }

  /**
   * Reset de la couleur
   */
  private resetColor(): string {
    return '\x1b[0m';
  }

  /**
   * Retourne toutes les métriques triées par ordre de fin
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics].sort((a, b) => a.order - b.order);
  }

  /**
   * Retourne les métriques par catégorie triées par ordre de fin
   */
  getMetricsByCategory(category: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category).sort((a, b) => a.order - b.order);
  }

  /**
   * Retourne les statistiques de performance
   */
  getStats(): {
    totalCalls: number;
    averageDuration: number;
    slowestMethod: PerformanceMetric | null;
    fastestMethod: PerformanceMetric | null;
    successRate: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalCalls: 0,
        averageDuration: 0,
        slowestMethod: null,
        fastestMethod: null,
        successRate: 0
      };
    }

    const successfulMetrics = this.metrics.filter(m => m.success);
    const averageDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length;
    const slowestMethod = this.metrics.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    const fastestMethod = this.metrics.reduce((fastest, current) => 
      current.duration < fastest.duration ? current : fastest
    );
    const successRate = (successfulMetrics.length / this.metrics.length) * 100;

    return {
      totalCalls: this.metrics.length,
      averageDuration: Number(averageDuration.toFixed(2)),
      slowestMethod,
      fastestMethod,
      successRate: Number(successRate.toFixed(2))
    };
  }

  /**
   * Affiche un résumé des performances
   */
  logSummary(): void {
    const stats = this.getStats();
    
    console.group('📊 Résumé des performances');
    console.log(`📞 Total d'appels: ${stats.totalCalls}`);
    console.log(`⏱️  Durée moyenne: ${stats.averageDuration}ms (${(stats.averageDuration / 1000).toFixed(3)}s)`);
    console.log(`✅ Taux de succès: ${stats.successRate}%`);
    
    if (stats.slowestMethod) {
      console.log(`🐌 Plus lent: ${stats.slowestMethod.methodName} (${stats.slowestMethod.duration.toFixed(2)}ms / ${stats.slowestMethod.durationSeconds.toFixed(3)}s)`);
    }
    
    if (stats.fastestMethod) {
      console.log(`⚡ Plus rapide: ${stats.fastestMethod.methodName} (${stats.fastestMethod.duration.toFixed(2)}ms / ${stats.fastestMethod.durationSeconds.toFixed(3)}s)`);
    }
    
    console.groupEnd();
  }

  /**
   * Efface toutes les métriques
   */
  clearMetrics(): void {
    this.metrics = [];
    this.orderCounter = 0; // Reset du compteur d'ordre
    console.log('🧹 Métriques de performance effacées');
  }
}
