import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Application } from '../services/application/application';
import { LoggingService } from '../../../shared/services/logging.service';
import { VersionService } from '../../../shared/services/versions/versions.service';


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.component.html'
})
export class CreateComponent {
  private readonly application = inject(Application);
  private readonly loggingService = inject(LoggingService);
  private readonly versionService = inject(VersionService);
  articleIdea = '';

  constructor() {
    // Afficher la version au démarrage
    this.versionService.logToConsole();
    this.loggingService.info('COMPONENT', '🚀 CreateComponent initialisé');
  }

  getNextPostId() {
    this.loggingService.info('COMPONENT', '🚀 Début appel getNextPostId()');    
    this.application.getNextPostId();
  }

  // Méthode de test pour vérifier le logging
  testLogging() {
    this.loggingService.debug('COMPONENT', '🐛 Test debug');
    this.loggingService.info('COMPONENT', 'ℹ️ Test info');
    this.loggingService.warn('COMPONENT', '⚠️ Test warning');
    this.loggingService.error('COMPONENT', '❌ Test error');
  }
} 