import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-article-generation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card class="generation-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>lightbulb</mat-icon>
        <mat-card-title>Nouvelle Idée d'Article</mat-card-title>
        <mat-card-subtitle>Décrivez votre idée et laissez l'IA créer le contenu</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="input-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Idée d'article</mat-label>
            <input 
              matInput 
              [ngModel]="articleIdea()" 
              (ngModelChange)="onArticleIdeaChange($event)"
              placeholder="Ex: Comment planter des roses en pot sur un balcon"
              type="text">
            <mat-icon matSuffix>edit</mat-icon>
          </mat-form-field>
          
          <div class="button-group">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="onGenerate()" 
              class="generate-button"
              [disabled]="!articleIdea().trim() || isGenerating()">
              <mat-spinner *ngIf="isGenerating()" diameter="20" class="button-spinner"></mat-spinner>
              <mat-icon *ngIf="!isGenerating()">rocket_launch</mat-icon>
              {{ isGenerating() ? 'Génération en cours...' : 'Générer l\'article' }}
            </button>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-footer *ngIf="isGenerating()" class="progress-section">
        <div class="progress-info">
          <div class="progress-text">
            <strong>Génération en cours...</strong>
            <span>Étape {{ step() }}/4</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="(step() / 4) * 100" class="progress-bar"></mat-progress-bar>
          <div class="progress-details">
            <span *ngIf="step() === 0">Initialisation...</span>
            <span *ngIf="step() === 1">Génération de l'article de base...</span>
            <span *ngIf="step() === 2">Ajout des images et enrichissement...</span>
            <span *ngIf="step() === 3">Ajout des liens internes...</span>
            <span *ngIf="step() === 4">Finalisation avec les noms botaniques...</span>
          </div>
        </div>
      </mat-card-footer>
    </mat-card>
  `,
  styles: [`
    .generation-card {
      margin-bottom: 24px;
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
    }

    .input-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: flex-start;
    }

    .generate-button {
      min-width: 200px;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 24px !important;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
      transition: all 0.3s ease;
    }

    .generate-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4) !important;
    }

    .generate-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .button-spinner {
      margin-right: 8px;
    }

    .progress-section {
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border-radius: 0 0 16px 16px !important;
      padding: 20px !important;
    }

    .progress-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .progress-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
    }

    .progress-text strong {
      color: #1976d2;
    }

    .progress-text span {
      color: #666;
      font-weight: 500;
    }

    .progress-bar {
      height: 8px !important;
      border-radius: 4px !important;
    }

    .progress-details {
      text-align: center;
      color: #666;
      font-style: italic;
    }
  `]
})
export class ArticleGenerationComponent {
  readonly articleIdea = input<string>('');
  readonly isGenerating = input<boolean>(false);
  readonly step = input<number>(0);
  
  readonly generate = output<void>();
  readonly articleIdeaChange = output<string>();

  onGenerate(): void {
    this.generate.emit();
  }

  onArticleIdeaChange(value: string): void {
    this.articleIdeaChange.emit(value);
  }
}
