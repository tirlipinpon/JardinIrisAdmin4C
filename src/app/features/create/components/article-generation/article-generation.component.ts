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
  templateUrl: './article-generation.component.html',
  styleUrl: './article-generation.component.css'
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
