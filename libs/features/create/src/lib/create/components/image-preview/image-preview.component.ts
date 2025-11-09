import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NgOptimizedImage
  ],
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.css'
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