import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="image-preview-card" *ngIf="imageUrl()">
      <mat-card-header>
        <mat-icon mat-card-avatar>image</mat-icon>
        <mat-card-title>Image principale</mat-card-title>
        <mat-card-subtitle>Aperçu de l'image générée pour l'article</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="image-preview-container">
          <img 
            [src]="imageUrl()" 
            [alt]="'Image pour: ' + (title() || 'Article')"
            class="preview-image"
            (error)="onImageError($event)"
            (load)="onImageLoad($event)">
          
          <div class="image-actions">
            <button mat-raised-button color="primary" (click)="onEditImageUrl()">
              <mat-icon>edit</mat-icon>
              Modifier l'URL
            </button>
            <button mat-raised-button (click)="onOpenImageInNewTab()">
              <mat-icon>open_in_new</mat-icon>
              Ouvrir dans un nouvel onglet
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .image-preview-card {
      margin-bottom: 24px;
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    }

    .image-preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .preview-image {
      max-width: 100%;
      max-height: 400px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      object-fit: contain;
    }

    .preview-image:hover {
      transform: scale(1.02);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .image-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .image-actions button {
      border-radius: 20px !important;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .image-actions button:hover {
      transform: translateY(-2px);
    }

    .image-actions button:first-child:hover {
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
    }

    .image-actions button:last-child:hover {
      box-shadow: 0 4px 12px rgba(158, 158, 158, 0.3) !important;
    }

    @media (max-width: 768px) {
      .image-actions {
        flex-direction: column;
        width: 100%;
      }

      .image-actions button {
        width: 100%;
      }
    }
  `]
})
export class ImagePreviewComponent {
  readonly imageUrl = input<string | null>(null);
  readonly title = input<string | null>(null);

  readonly editImageUrl = output<void>();
  readonly openImageInNewTab = output<void>();
  readonly imageError = output<Event>();
  readonly imageLoad = output<Event>();

  onEditImageUrl(): void {
    this.editImageUrl.emit();
  }

  onOpenImageInNewTab(): void {
    this.openImageInNewTab.emit();
  }

  onImageError(event: Event): void {
    this.imageError.emit(event);
  }

  onImageLoad(event: Event): void {
    this.imageLoad.emit(event);
  }
}
