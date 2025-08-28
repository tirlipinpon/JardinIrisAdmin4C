import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoggingService } from '../../shared/services/logging.service';
import { VersionService } from '../../shared/services/versions/versions.service';
import { Application } from './component/application/application';


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
  }

  generate() {
    this.loggingService.info('COMPONENT', '🚀 Début appel generate()');    
    this.application.getNextPostId();
    this.application.setPost(this.articleIdea);
    this.application.getLastPostTitreAndId();
  }

} 