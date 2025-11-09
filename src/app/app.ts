import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VersionService } from '@jardin-iris/core/data-access';
import { VersionsComponent } from '@jardin-iris/shared/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VersionsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private readonly versionService = inject(VersionService);
  protected readonly title = signal('JardinIrisAdmin4C');
  ngOnInit(): void {
    // Affiche les infos de version dans la console au démarrage
    this.versionService.logToConsole();
    // Optionnel : ajouter le numéro de build au titre de la page
    this.versionService.setPageTitle();
  }
}
