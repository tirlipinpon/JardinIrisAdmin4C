import { PerformanceService } from '@jardin-iris/core/data-access';

/**
 * Décorateur pour mesurer automatiquement les performances d'une méthode
 * 
 * @param category - Catégorie de la méthode (Database, API External, etc.)
 * @param methodName - Nom de la méthode (optionnel, sera détecté automatiquement)
 * 
 * @example
 * ```typescript
 * @MeasurePerformance('Database')
 * getNextPostId(): Observable<number | PostgrestError> {
 *   // ... code de la méthode
 * }
 * ```
 */
export function MeasurePerformance(category: string, methodName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const performanceService = new PerformanceService();

    descriptor.value = function (...args: any[]) {
      const actualMethodName = methodName || propertyKey;
      
      return performanceService.measure(
        actualMethodName,
        category,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}
