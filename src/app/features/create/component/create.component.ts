import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Application } from '../services/application/application';
import { LoggingService } from '../../../shared/services/logging.service';


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.component.html'
})
export class CreateComponent {
  private readonly application = inject(Application);
  private readonly loggingService = inject(LoggingService);
  articleIdea = '';

  getNextPostId() {
    this.loggingService.info('COMPONENT', '🚀 Début appel getNextPostId()');    
    this.application.getNextPostId();
  }
} 