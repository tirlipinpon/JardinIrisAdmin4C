import { Component } from '@angular/core';
import { VERSION } from '../services/version';


@Component({
  selector: 'app-version',
  standalone: true,
  template: `
    <div class="version-info">
      <div class="version-badge">
        <span class="version-number">Build #{{ version.buildNumber }}</span>
        <span class="version-date">{{ formatDate(version.buildDate) }}</span>
      </div>
    </div>
  `,
  styles: [`
    .version-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 12px 20px;
      border-radius: 8px;
      margin: 10px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .version-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      font-family: 'Courier New', monospace;
    }
    .version-number {
      font-weight: bold;
      font-size: 16px;
      background: rgba(255,255,255,0.2);
      padding: 4px 8px;
      border-radius: 4px;
    }
    .version-date {
      font-size: 14px;
      opacity: 0.9;
    }
  `]
})
export class VersionsComponent {
  version = VERSION;

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  // Méthode pour afficher dans la console
  logVersionInfo(): void {
    console.log('Version Info:', this.version);
  }
}
