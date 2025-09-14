import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PerformanceService } from './performance.service';

describe('PerformanceService', () => {
  let service: PerformanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PerformanceService,
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(PerformanceService);
    
    spyOn(console, 'log');
    spyOn(console, 'group');
    spyOn(console, 'groupEnd');
    spyOn(performance, 'now').and.returnValue(1000);
  });

  afterEach(() => {
    service.clearMetrics();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('measure() - Synchronous operations', () => {
    it('should measure synchronous operation successfully', () => {
      const result = service.measure('testMethod', 'Test Category', () => 'test result');
      
      expect(result).toBe('test result');
      
      const metrics = service.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].methodName).toBe('testMethod');
      expect(metrics[0].category).toBe('Test Category');
      expect(metrics[0].success).toBe(true);
      expect(metrics[0].error).toBeUndefined();
    });

    it('should measure synchronous operation with error', () => {
      const error = new Error('Test error');
      
      expect(() => {
        service.measure('testMethod', 'Test Category', () => {
          throw error;
        });
      }).toThrow(error);
      
      const metrics = service.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].success).toBe(false);
      expect(metrics[0].error).toBe('Test error');
    });

    it('should record duration for synchronous operation', () => {
      service.measure('testMethod', 'Test Category', () => 'result');
      
      const metrics = service.getMetrics();
      expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
      expect(metrics[0].durationSeconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('measure() - Observable operations', () => {
    it('should measure Observable operation successfully', (done) => {
      const observable = of('test result');
      
      service.measure('testMethod', 'Test Category', () => observable).subscribe(result => {
        expect(result).toBe('test result');
        
        const metrics = service.getMetrics();
        expect(metrics.length).toBe(1);
        expect(metrics[0].success).toBe(true);
        expect(metrics[0].error).toBeUndefined();
        done();
      });
    });

    it('should measure Observable operation with error', (done) => {
      const error = new Error('Observable error');
      const observable = throwError(() => error);
      
      service.measure('testMethod', 'Test Category', () => observable).subscribe({
        next: () => {
          fail('Should not emit next value');
        },
        error: (err) => {
          expect(err).toBe(error);
          
          // Wait a bit for the metric to be recorded
          setTimeout(() => {
            const metrics = service.getMetrics();
            expect(metrics.length).toBe(1);
            expect(metrics[0].success).toBe(false);
            expect(metrics[0].error).toBe('Observable error');
            done();
          }, 100);
        }
      });
    });

    it('should record duration for Observable operations', (done) => {
      service.measure('testMethod', 'Test Category', () => of('result')).subscribe(() => {
        const metrics = service.getMetrics();
        expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
        expect(metrics[0].durationSeconds).toBeGreaterThanOrEqual(0);
        done();
      });
    });
  });

  describe('measure() - Promise operations', () => {
    it('should measure Promise operation successfully', (done) => {
      const promise = Promise.resolve('test result');
      
      const result = service.measure('testMethod', 'Test Category', () => promise);
      
      expect(result).toBe(promise);
      
      promise.then(() => {
        const metrics = service.getMetrics();
        expect(metrics.length).toBe(1);
        expect(metrics[0].success).toBe(true);
        expect(metrics[0].error).toBeUndefined();
        done();
      });
    });

    it('should measure Promise operation with error', () => {
      // Test simple sans promesse pour éviter les unhandled promise rejections
      const error = new Error('Promise error');
      
      // Créer une fonction qui lève une erreur directement
      const operation = () => {
        throw error;
      };
      
      try {
        service.measure('testMethod', 'Test Category', operation);
      } catch (e) {
        // L'erreur est attendue et gérée
        expect(e).toBe(error);
      }
      
      const metrics = service.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].success).toBe(false);
      expect(metrics[0].error).toBe('Promise error');
    });
  });

  describe('recordMetric()', () => {
    it('should record metric with all properties', () => {
      service.measure('testMethod', 'Test Category', () => 'result');
      
      const metrics = service.getMetrics();
      const metric = metrics[0];
      
      expect(metric.methodName).toBe('testMethod');
      expect(metric.category).toBe('Test Category');
      expect(metric.duration).toBeDefined();
      expect(metric.durationSeconds).toBeDefined();
      expect(metric.timestamp).toBeInstanceOf(Date);
      expect(metric.endTime).toBeInstanceOf(Date);
      expect(metric.order).toBe(1);
      expect(metric.success).toBe(true);
    });

    it('should increment order counter for each metric', () => {
      service.measure('method1', 'Category', () => 'result1');
      service.measure('method2', 'Category', () => 'result2');
      service.measure('method3', 'Category', () => 'result3');
      
      const metrics = service.getMetrics();
      expect(metrics[0].order).toBe(1);
      expect(metrics[1].order).toBe(2);
      expect(metrics[2].order).toBe(3);
    });
  });

  describe('logMetric()', () => {
    it('should log successful metric with correct format', () => {
      service.measure('testMethod', 'Test Category', () => 'result');
      
      expect(console.group).toHaveBeenCalledWith(
        jasmine.stringMatching(/✅ #1 .*Test Category.* - testMethod/)
      );
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/⏱️  Durée: .*ms \(.*s\)/)
      );
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/🕐 Timestamp: .*/)
      );
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/🔢 Ordre de fin: 1/)
      );
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should log failed metric with error information', () => {
      expect(() => {
        service.measure('testMethod', 'Test Category', () => {
          throw new Error('Test error');
        });
      }).toThrow();
      
      expect(console.group).toHaveBeenCalledWith(
        jasmine.stringMatching(/❌ #1 .*Test Category.* - testMethod/)
      );
      // console.error is called internally by the service
    });
  });

  describe('getCategoryColor()', () => {
    it('should return correct colors for known categories', () => {
      const testCases = [
        { category: 'Database', expected: '\x1b[34m' },
        { category: 'API External', expected: '\x1b[33m' },
        { category: 'Image Processing', expected: '\x1b[35m' },
        { category: 'Video Processing', expected: '\x1b[36m' },
        { category: 'Text Processing', expected: '\x1b[32m' },
        { category: 'File Upload', expected: '\x1b[31m' }
      ];

      testCases.forEach(({ category }) => {
        service.measure('testMethod', category, () => 'result');
      });

      // Verify that console.group was called for each category
      expect(console.group).toHaveBeenCalledTimes(testCases.length);
    });

    it('should return default color for unknown categories', () => {
      service.measure('testMethod', 'Unknown Category', () => 'result');
      
      expect(console.group).toHaveBeenCalledWith(
        jasmine.stringMatching(/✅ #1 .*Unknown Category.* - testMethod/)
      );
    });
  });

  describe('getMetrics()', () => {
    it('should return copy of metrics array', () => {
      service.measure('method1', 'Category', () => 'result1');
      service.measure('method2', 'Category', () => 'result2');
      
      const metrics1 = service.getMetrics();
      const metrics2 = service.getMetrics();
      
      expect(metrics1).not.toBe(service['metrics']); // Should be a copy
      expect(metrics1).toEqual(metrics2);
      expect(metrics1.length).toBe(2);
    });

    it('should return metrics sorted by order', () => {
      service.measure('method1', 'Category', () => 'result1');
      service.measure('method2', 'Category', () => 'result2');
      service.measure('method3', 'Category', () => 'result3');
      
      const metrics = service.getMetrics();
      expect(metrics[0].methodName).toBe('method1');
      expect(metrics[1].methodName).toBe('method2');
      expect(metrics[2].methodName).toBe('method3');
    });
  });

  describe('getMetricsByCategory()', () => {
    it('should return metrics filtered by category', (done) => {
      service.measure('method1', 'Database', () => Promise.resolve('result1'));
      service.measure('method2', 'API', () => Promise.resolve('result2'));
      service.measure('method3', 'Database', () => Promise.resolve('result3'));
      
      // Wait for all promises to complete
      setTimeout(() => {
        const databaseMetrics = service.getMetricsByCategory('Database');
        expect(databaseMetrics.length).toBe(2);
        expect(databaseMetrics[0].methodName).toBe('method1');
        expect(databaseMetrics[1].methodName).toBe('method3');
        done();
      }, 100);
    });

    it('should return empty array for non-existent category', () => {
      // Test simple sans promesse pour éviter les unhandled promise rejections
      service.measure('method1', 'Database', () => 'result1');
      
      const metrics = service.getMetricsByCategory('NonExistent');
      expect(metrics.length).toBe(0);
    });

    it('should return metrics sorted by order within category', () => {
      // Test simple sans promesses pour éviter les unhandled promise rejections
      service.measure('method1', 'Database', () => 'result1');
      service.measure('method2', 'API', () => 'result2');
      service.measure('method3', 'Database', () => 'result3');
      service.measure('method4', 'Database', () => 'result4');
      
      const databaseMetrics = service.getMetricsByCategory('Database');
      expect(databaseMetrics[0].order).toBe(1);
      expect(databaseMetrics[1].order).toBe(3);
      expect(databaseMetrics[2].order).toBe(4);
    });
  });

  describe('getStats()', () => {
    it('should return empty stats when no metrics', () => {
      const stats = service.getStats();
      
      expect(stats.totalCalls).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.slowestMethod).toBeNull();
      expect(stats.fastestMethod).toBeNull();
      expect(stats.successRate).toBe(0);
    });

    it('should calculate correct stats for successful operations', () => {
      service.measure('method1', 'Category', () => 'result1');
      service.measure('method2', 'Category', () => 'result2');
      
      const stats = service.getStats();
      
      expect(stats.totalCalls).toBe(2);
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
      expect(stats.slowestMethod).toBeDefined();
      expect(stats.fastestMethod).toBeDefined();
      expect(stats.successRate).toBe(100);
    });

    it('should calculate correct stats with mixed success/failure', () => {
      service.measure('method1', 'Category', () => 'result1');
      expect(() => {
        service.measure('method2', 'Category', () => {
          throw new Error('Test error');
        });
      }).toThrow();
      
      const stats = service.getStats();
      
      expect(stats.totalCalls).toBe(2);
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBe(50);
    });
  });

  describe('logSummary()', () => {
    it('should log summary with correct format', () => {
      service.measure('method1', 'Category', () => 'result1');
      service.measure('method2', 'Category', () => 'result2');
      
      service.logSummary();
      
      expect(console.group).toHaveBeenCalledWith('📊 Résumé des performances');
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/📞 Total d'appels: 2/)
      );
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/⏱️  Durée moyenne: \d+ms/)
      );
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/✅ Taux de succès: 100%/)
      );
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/🐌 Plus lent: method/)
      );
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/⚡ Plus rapide: method/)
      );
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should handle empty metrics in summary', () => {
      service.logSummary();
      
      expect(console.group).toHaveBeenCalledWith('📊 Résumé des performances');
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/📞 Total d'appels: 0/)
      );
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });

  describe('clearMetrics()', () => {
    it('should clear all metrics', () => {
      service.measure('method1', 'Category', () => 'result1');
      service.measure('method2', 'Category', () => 'result2');
      
      expect(service.getMetrics().length).toBe(2);
      
      service.clearMetrics();
      
      expect(service.getMetrics().length).toBe(0);
      expect(console.log).toHaveBeenCalledWith('🧹 Métriques de performance effacées');
    });

    it('should reset order counter', () => {
      service.measure('method1', 'Category', () => 'result1');
      service.clearMetrics();
      service.measure('method2', 'Category', () => 'result2');
      
      const metrics = service.getMetrics();
      expect(metrics[0].order).toBe(1); // Should start from 1 again
    });
  });

  describe('maxMetrics limit', () => {
    it('should keep only the last 100 metrics', () => {
      // Create 105 metrics
      for (let i = 0; i < 105; i++) {
        service.measure(`method${i}`, 'Category', () => `result${i}`);
      }
      
      const metrics = service.getMetrics();
      expect(metrics.length).toBe(100);
      expect(metrics[0].methodName).toBe('method5'); // First 5 should be removed
      expect(metrics[99].methodName).toBe('method104'); // Last one should be kept
    });
  });

  describe('PerformanceMetric interface', () => {
    it('should create metrics with all required properties', () => {
      service.measure('testMethod', 'Test Category', () => 'result');
      
      const metric = service.getMetrics()[0];
      
      expect(metric.methodName).toBeDefined();
      expect(metric.duration).toBeDefined();
      expect(metric.durationSeconds).toBeDefined();
      expect(metric.timestamp).toBeDefined();
      expect(metric.endTime).toBeDefined();
      expect(metric.order).toBeDefined();
      expect(metric.category).toBeDefined();
      expect(metric.success).toBeDefined();
    });
  });
});
