import { Component } from '@angular/core';
import { VERSION } from '../services/version';


@Component({
  selector: 'app-version',
  standalone: true,
  template: `
    <div class="version-info">
      <p><strong>Build #:</strong> {{ version.buildNumber }} <strong>Date de build:</strong> {{ formatDate(version.buildDate) }}</p>
    </div>
  `,
  styles: [`
    .version-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
      font-family: monospace;
    }
    .version-info h3 {
      margin-top: 0;
      color: #333;
    }
    .version-info p {
      margin: 5px 0;
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
