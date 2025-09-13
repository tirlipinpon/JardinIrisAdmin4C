import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

export interface ProcessCompletionData {
  stats: {
    characters: number;
    words: number;
    paragraphs: number;
  };
  internalLinksStats: {
    total: number;
    unique: number;
    duplicates: number;
  };
  botanicalCount: number;
  faqCount: number;
  imagesCount: number;
  hasVideo: boolean;
}

@Component({
  selector: 'app-process-completion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './process-completion-dialog.component.html',
  styleUrls: ['./process-completion-dialog.component.css']
})
export class ProcessCompletionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProcessCompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProcessCompletionData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Émettre un événement pour déclencher la sauvegarde
    this.dialogRef.close('save');
  }
}
