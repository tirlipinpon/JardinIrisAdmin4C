import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Application } from '../services/application/application';


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.component.html'
})
export class CreateComponent {
  private readonly application = inject(Application);
  articleIdea = '';

  getNextPostId() {
    this.application.getNextPostId();
  }
} 