import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="error-card" *ngIf="errors().length > 0">
      <mat-card-header class="error-header">
        <mat-icon class="error-icon">error</mat-icon>
        <mat-card-title class="error-title">
          Erreur{{ errors().length > 1 ? 's' : '' }} détectée{{ errors().length > 1 ? 's' : '' }}
        </mat-card-title>
        <button mat-icon-button (click)="onClearErrors()" class="error-close">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        <div class="error-list">
          <mat-chip-set>
            <mat-chip *ngFor="let error of errors(); trackBy: trackByIndex" class="error-chip">
              <mat-icon matChipAvatar>warning</mat-icon>
              {{ error }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .error-card {
      margin-bottom: 24px;
      border-radius: 12px !important;
      border-left: 4px solid #f44336 !important;
      background: #ffebee !important;
    }

    .error-header {
      background: transparent !important;
      padding-bottom: 8px !important;
    }

    .error-icon {
      color: #f44336 !important;
      margin-right: 12px;
    }

    .error-title {
      color: #d32f2f !important;
      font-weight: 600 !important;
    }

    .error-close {
      margin-left: auto;
    }

    .error-chip {
      background: #ffcdd2 !important;
      color: #c62828 !important;
      margin: 4px !important;
    }
  `]
})
export class ErrorDisplayComponent {
  readonly errors = input<string[]>([]);
  readonly clearErrors = output<void>();

  trackByIndex(index: number): number {
    return index;
  }

  onClearErrors(): void {
    this.clearErrors.emit();
  }
}
