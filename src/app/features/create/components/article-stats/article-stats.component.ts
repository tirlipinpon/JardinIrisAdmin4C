import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface ArticleStats {
  characters: number;
  words: number;
  paragraphs: number;
}

export interface InternalLinksStats {
  total: number;
  unique: number;
  duplicates: number;
}

@Component({
  selector: 'app-article-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="stats-card" *ngIf="article()">
      <mat-card-header>
        <mat-icon mat-card-avatar class="stats-avatar">analytics</mat-icon>
        <mat-card-title>Statistiques de l'Article</mat-card-title>
        <mat-card-subtitle>Aperçu des métriques de votre contenu</mat-card-subtitle>
        <div class="header-actions">
          <button 
            mat-raised-button 
            color="accent"
            (click)="onSaveAllData()"
            [disabled]="isGenerating() || !canSave()"
            class="save-button">
            <mat-icon>save</mat-icon>
            Sauvegarder tout
          </button>
          <button 
            mat-raised-button 
            color="primary"
            (click)="onShowPerformanceStats()"
            class="performance-button">
            <mat-icon>speed</mat-icon>
            Performances
          </button>
        </div>
      </mat-card-header>
      
      <mat-card-content>
        <div class="stats-grid">
          <div class="stat-card">
            <mat-icon class="stat-icon">article</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ articleStats().characters }}</div>
              <div class="stat-label">Caractères</div>
            </div>
          </div>
          
          <div class="stat-card">
            <mat-icon class="stat-icon">text_fields</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ articleStats().words }}</div>
              <div class="stat-label">Mots</div>
            </div>
          </div>
          
          <div class="stat-card">
            <mat-icon class="stat-icon">format_list_numbered</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ articleStats().paragraphs }}</div>
              <div class="stat-label">Paragraphes</div>
            </div>
          </div>
          
          <div class="stat-card">
            <mat-icon class="stat-icon">image</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ internalImagesCount() }}</div>
              <div class="stat-label">Images</div>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="faqCount() > 0">
            <mat-icon class="stat-icon">help</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ faqCount() }}</div>
              <div class="stat-label">FAQ</div>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="imageUrl()">
            <mat-icon class="stat-icon">image</mat-icon>
            <div class="stat-content">
              <div class="stat-value">✓</div>
              <div class="stat-label">Image principale</div>
            </div>
            <button mat-icon-button (click)="onEditImageUrl()" class="edit-button" title="Éditer l'image">
              <mat-icon>edit</mat-icon>
            </button>
          </div>
          
          <div class="stat-card" *ngIf="video()">
            <mat-icon class="stat-icon">videocam</mat-icon>
            <div class="stat-content">
              <div class="stat-value">✓</div>
              <div class="stat-label">Vidéo</div>
            </div>
          </div>
          
          <div class="stat-card">
            <mat-icon class="stat-icon">eco</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ botanicalNamesCount() }}</div>
              <div class="stat-label">Noms botaniques</div>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="internalLinksStats().total > 0">
            <mat-icon class="stat-icon">link</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ internalLinksStats().total }}</div>
              <div class="stat-label">Liens internes</div>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="internalLinksStats().unique > 0">
            <mat-icon class="stat-icon">link_off</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ internalLinksStats().unique }}</div>
              <div class="stat-label">Liens uniques</div>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="internalLinksStats().duplicates > 0">
            <mat-icon class="stat-icon">content_copy</mat-icon>
            <div class="stat-content">
              <div class="stat-value">{{ internalLinksStats().duplicates }}</div>
              <div class="stat-label">Doublons</div>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stats-card {
      margin-bottom: 24px;
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    }

    .stats-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
    }

    .header-actions {
      margin-left: auto;
      display: flex;
      gap: 12px;
    }

    .save-button, .performance-button {
      border-radius: 20px !important;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .save-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3) !important;
    }

    .performance-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      color: #667eea;
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      margin-right: 12px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #2c5530;
      line-height: 1;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .edit-button {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
    }

    .edit-button mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
      }

      .header-actions {
        flex-direction: column;
        gap: 8px;
      }

      .save-button, .performance-button {
        width: 100%;
      }
    }
  `]
})
export class ArticleStatsComponent {
  readonly article = input<string | null>(null);
  readonly isGenerating = input<boolean>(false);
  readonly canSave = input<boolean>(false);
  readonly articleStats = input<ArticleStats>({ characters: 0, words: 0, paragraphs: 0 });
  readonly internalImagesCount = input<number>(0);
  readonly faqCount = input<number>(0);
  readonly imageUrl = input<string | null>(null);
  readonly video = input<string | null>(null);
  readonly botanicalNamesCount = input<number>(0);
  readonly internalLinksStats = input<InternalLinksStats>({ total: 0, unique: 0, duplicates: 0 });

  readonly saveAllData = output<void>();
  readonly showPerformanceStats = output<void>();
  readonly editImageUrl = output<void>();

  onSaveAllData(): void {
    this.saveAllData.emit();
  }

  onShowPerformanceStats(): void {
    this.showPerformanceStats.emit();
  }

  onEditImageUrl(): void {
    this.editImageUrl.emit();
  }
}
