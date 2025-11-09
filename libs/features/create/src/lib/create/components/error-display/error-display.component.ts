import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.css'
})
export class ErrorDisplayComponent {
  readonly errors = input<string[]>([]);

  readonly removeError = output<string>();
  readonly clearAllErrors = output<void>();

  onRemoveError(error: string): void {
    this.removeError.emit(error);
  }

  onClearAllErrors(): void {
    this.clearAllErrors.emit();
  }

  trackByError(index: number, error: string): string {
    return error;
  }
}