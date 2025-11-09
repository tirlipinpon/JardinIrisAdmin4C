import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-post-form-editor',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ng-container *ngIf="shouldLoad()">
      <ng-container *ngComponentOutlet="postFormEditorComponent"></ng-container>
    </ng-container>
  `
})
export class LazyPostFormEditorComponent {
  postFormEditorComponent: any = null;

  async ngOnInit() {
    // Charger le composant seulement quand nécessaire
    const module = await import('../post-form-editor/post-form-editor.component');
    this.postFormEditorComponent = module.PostFormEditorComponent;
  }

  shouldLoad(): boolean {
    return this.postFormEditorComponent !== null;
  }
}
