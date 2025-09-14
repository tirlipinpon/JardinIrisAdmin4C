import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { PerformanceService, PerformanceMetric } from '../../../../shared/services/performance.service';
import { InfrastructurePerformanceService } from '../../../../shared/services/infrastructure-performance.service';

@Component({
  selector: 'app-performance-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="performance-card" *ngIf="showPerformance()">
      <mat-card-header>
        <mat-icon mat-card-avatar class="performance-avatar">speed</mat-icon>
        <mat-card-title>Performances en Temps Réel</mat-card-title>
        <mat-card-subtitle>Suivi des temps d'exécution des fonctions</mat-card-subtitle>
        <div class="header-actions">
          <button mat-icon-button (click)="clearMetrics()" title="Effacer les métriques">
            <mat-icon>clear_all</mat-icon>
          </button>
          <button mat-icon-button (click)="toggleAutoRefresh()" [class.active]="autoRefresh()" title="Actualisation automatique">
            <mat-icon>{{ autoRefresh() ? 'pause' : 'play_arrow' }}</mat-icon>
          </button>
        </div>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Statistiques globales -->
        <div class="stats-summary" *ngIf="stats()">
          <div class="stat-item">
            <mat-icon class="stat-icon">timeline</mat-icon>
            <span class="stat-label">Total d'appels:</span>
            <span class="stat-value">{{ stats().totalCalls }}</span>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon">schedule</mat-icon>
            <span class="stat-label">Durée moyenne:</span>
            <span class="stat-value">{{ (stats().averageDuration / 1000).toFixed(3) }}s</span>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon">check_circle</mat-icon>
            <span class="stat-label">Taux de succès:</span>
            <span class="stat-value">{{ stats().successRate }}%</span>
          </div>
        </div>

        <mat-divider class="divider"></mat-divider>

        <!-- Liste des métriques en temps réel -->
        <div class="metrics-list">
          <div class="metrics-header">
            <h4>Fonctions exécutées</h4>
            <mat-chip-set>
              <mat-chip 
                *ngFor="let category of categories()" 
                [class]="'category-chip ' + category.toLowerCase().replace(' ', '-')"
                (click)="toggleCategory(category)">
                {{ category }}
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="metrics-container">
            <div 
              *ngFor="let metric of filteredMetrics()" 
              class="metric-item"
              [class.success]="metric.success"
              [class.error]="!metric.success"
              [class.recent]="isRecent(metric)">
              
              <div class="metric-header">
                <div class="metric-info">
                  <mat-icon class="status-icon">
                    {{ metric.success ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span class="order-number">#{{ metric.order }}</span>
                  <span class="function-name">{{ metric.methodName }}</span>
                  <mat-chip class="category-chip-small">{{ metric.category }}</mat-chip>
                </div>
                <div class="metric-time">
                  <span class="duration">{{ metric.durationSeconds.toFixed(3) }}s</span>
                  <span class="timestamp">{{ formatTime(metric.timestamp) }}</span>
                </div>
              </div>

              <div class="metric-details" *ngIf="!metric.success && metric.error">
                <div class="error-message">
                  <mat-icon>warning</mat-icon>
                  <span>{{ metric.error }}</span>
                </div>
              </div>

              <div class="metric-progress">
                <mat-progress-bar 
                  [value]="getProgressValue(metric)" 
                  [color]="metric.success ? 'primary' : 'warn'"
                  mode="determinate">
                </mat-progress-bar>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucune métrique -->
        <div class="no-metrics" *ngIf="metrics().length === 0">
          <mat-icon>info</mat-icon>
          <p>Aucune fonction exécutée pour le moment</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .performance-card {
      margin-bottom: 24px;
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    }

    .performance-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
    }

    .header-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }

    .header-actions button {
      transition: all 0.3s ease;
    }

    .header-actions button.active {
      background: rgba(33, 150, 243, 0.1) !important;
      color: #2196f3 !important;
    }

    .stats-summary {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      min-width: 150px;
    }

    .stat-icon {
      color: #667eea;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: #2c5530;
    }

    .divider {
      margin: 16px 0 !important;
    }

    .metrics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .metrics-header h4 {
      margin: 0;
      color: #2c5530;
      font-weight: 600;
    }

    .category-chip {
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 2px !important;
    }

    .category-chip:hover {
      transform: scale(1.05);
    }

    .category-chip.database {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .category-chip.api-external {
      background: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .category-chip.image-processing {
      background: #f3e5f5 !important;
      color: #7b1fa2 !important;
    }

    .category-chip.video-processing {
      background: #e0f2f1 !important;
      color: #00695c !important;
    }

    .category-chip.text-processing {
      background: #e8f5e8 !important;
      color: #388e3c !important;
    }

    .category-chip.file-upload {
      background: #ffebee !important;
      color: #d32f2f !important;
    }

    .category-chip.article-generation {
      background: #fff8e1 !important;
      color: #f9a825 !important;
    }

    .metrics-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
    }

    .metric-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      animation: slideInRight 0.3s ease-out;
    }

    .metric-item:last-child {
      border-bottom: none;
    }

    .metric-item:hover {
      background: #f8f9fa;
    }

    .metric-item.recent {
      background: rgba(76, 175, 80, 0.05);
      border-left: 3px solid #4caf50;
    }

    .metric-item.error {
      background: rgba(244, 67, 54, 0.05);
      border-left: 3px solid #f44336;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .metric-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .status-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    .status-icon.check_circle {
      color: #4caf50;
    }

    .status-icon.error {
      color: #f44336;
    }

    .order-number {
      font-weight: 700;
      color: #667eea;
      font-size: 12px;
      background: rgba(102, 126, 234, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 8px;
    }

    .function-name {
      font-weight: 600;
      color: #2c5530;
      font-size: 14px;
    }

    .category-chip-small {
      font-size: 10px !important;
      height: 20px !important;
      padding: 0 8px !important;
    }

    .metric-time {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .duration {
      font-weight: 700;
      font-size: 16px;
      color: #2c5530;
    }

    .timestamp {
      font-size: 11px;
      color: #666;
    }

    .metric-details {
      margin-bottom: 8px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 4px;
      font-size: 12px;
      color: #d32f2f;
    }

    .metric-progress {
      margin-top: 8px;
    }

    .no-metrics {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-metrics mat-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      color: #ccc;
      margin-bottom: 16px;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .stats-summary {
        flex-direction: column;
        gap: 12px;
      }

      .stat-item {
        min-width: auto;
      }

      .metrics-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .metric-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .metric-time {
        align-items: flex-start;
      }
    }
  `]
})
export class PerformanceDisplayComponent {
  private readonly performanceService = inject(PerformanceService);
  private readonly infrastructurePerformanceService = inject(InfrastructurePerformanceService);
  
  // Signals pour la réactivité
  readonly metrics = signal<PerformanceMetric[]>([]);
  readonly stats = signal<any>(null);
  readonly autoRefresh = signal(true);
  readonly showPerformance = signal(true);
  readonly selectedCategories = signal<string[]>([]);
  
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL = 1000; // 1 seconde

  constructor() {
    // Actualisation automatique des métriques
    this.startAutoRefresh();
  }

  // Computed pour les catégories disponibles
  readonly categories = computed(() => {
    const allCategories = this.metrics().map(m => m.category);
    return [...new Set(allCategories)];
  });

  // Computed pour les métriques filtrées
  readonly filteredMetrics = computed(() => {
    const selected = this.selectedCategories();
    if (selected.length === 0) {
      return this.metrics();
    }
    return this.metrics().filter(m => selected.includes(m.category));
  });

  ngOnInit() {
    this.updateMetrics();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  private startAutoRefresh() {
    if (this.autoRefresh()) {
      this.refreshInterval = setInterval(() => {
        this.updateMetrics();
      }, this.REFRESH_INTERVAL);
    }
  }

  private stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private updateMetrics() {
    // Utiliser uniquement le PerformanceService qui contient toutes les métriques
    const serviceMetrics = this.performanceService.getMetrics();
    
    this.metrics.set(serviceMetrics);
    this.stats.set(this.performanceService.getStats());
  }

  toggleAutoRefresh() {
    this.autoRefresh.set(!this.autoRefresh());
    if (this.autoRefresh()) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  toggleCategory(category: string) {
    const selected = this.selectedCategories();
    const index = selected.indexOf(category);
    
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(category);
    }
    
    this.selectedCategories.set([...selected]);
  }

  clearMetrics() {
    this.performanceService.clearMetrics();
    this.updateMetrics();
  }

  isRecent(metric: PerformanceMetric): boolean {
    const now = new Date();
    const metricTime = new Date(metric.timestamp);
    const diffMs = now.getTime() - metricTime.getTime();
    return diffMs < 5000; // Moins de 5 secondes
  }

  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getProgressValue(metric: PerformanceMetric): number {
    // Calculer la valeur de progression basée sur la durée
    // Plus la durée est longue, plus la barre est remplie
    const maxDuration = 10000; // 10 secondes max (en ms)
    return Math.min((metric.duration / maxDuration) * 100, 100);
  }
}
