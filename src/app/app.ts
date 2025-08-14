import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VersionService } from './shared/services/versions/versions.service';
import { VersionsComponent } from "./shared/versions/versions.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VersionsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly versionService = inject(VersionService);
  protected readonly title = signal('JardinIrisAdmin4C');
  ngOnInit(): void {
    // Affiche les infos de version dans la console au démarrage
    this.versionService.logToConsole();
    // Optionnel : ajouter le numéro de build au titre de la page
    this.versionService.setPageTitle();
  }
}
