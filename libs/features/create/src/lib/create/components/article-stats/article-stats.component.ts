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
  templateUrl: './article-stats.component.html',
  styleUrl: './article-stats.component.css'
})
export class ArticleStatsComponent {
  readonly article = input<string | null>(null);
  readonly stats = input<ArticleStats>({ characters: 0, words: 0, paragraphs: 0 });
  readonly internalLinks = input<InternalLinksStats>({ total: 0, unique: 0, duplicates: 0 });
  readonly showActions = input<boolean>(false);
  readonly isGenerating = input<boolean>(false);
  readonly canSave = input<boolean>(false);
  readonly articleStats = input<ArticleStats>({ characters: 0, words: 0, paragraphs: 0 });
  readonly internalImagesCount = input<number>(0);
  readonly faqCount = input<number>(0);
  readonly imageUrl = input<string | null>(null);
  readonly video = input<any>(null);
  readonly botanicalNamesCount = input<number>(0);
  readonly internalLinksStats = input<InternalLinksStats>({ total: 0, unique: 0, duplicates: 0 });

  readonly optimize = output<void>();

  onOptimize(): void {
    this.optimize.emit();
  }
}