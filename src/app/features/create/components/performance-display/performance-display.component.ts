import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface PerformanceData {
  totalTime: number;
  completedTasks: number;
  totalTasks: number;
  apiCalls: number;
  dataProcessed: number;
}

@Component({
  selector: 'app-performance-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './performance-display.component.html',
  styleUrl: './performance-display.component.css'
})
export class PerformanceDisplayComponent {
  readonly performanceData = input<PerformanceData | null>(null);
  readonly showChart = input<boolean>(false);
}