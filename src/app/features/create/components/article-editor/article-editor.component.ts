import { Component, input, output, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxEditorModule],
  template: `
    <div class="article-editor">
      <div class="editor-header">
        <h3>📝 Éditeur d'article avancé</h3>
        <div class="editor-controls">
          <button 
            type="button" 
            class="btn btn-primary" 
            (click)="onSave()"
            [disabled]="!articleContent">
            💾 Sauvegarder
          </button>
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="togglePreview()">
            {{ showPreview ? '📝 Éditer' : '👁️ Aperçu' }}
          </button>
          <button 
            type="button" 
            class="btn btn-info" 
            (click)="toggleRawHtml()">
            {{ showRawHtml ? '🎨 Visuel' : '📄 HTML' }}
          </button>
        </div>
      </div>
      
      <div class="editor-content">
        <!-- Éditeur NgxEditor -->
        <div class="ngx-editor-panel" *ngIf="!showPreview && !showRawHtml">
          <ngx-editor-menu [editor]="editor" [toolbar]="toolbar"></ngx-editor-menu>
          <ngx-editor 
            [editor]="editor" 
            [formControl]="articleFormControl"
            placeholder="Votre article apparaîtra ici...">
          </ngx-editor>
        </div>
        
        <!-- Éditeur HTML brut -->
        <div class="raw-html-panel" *ngIf="!showPreview && showRawHtml">
          <textarea
            [(ngModel)]="articleContent"
            class="article-textarea"
            placeholder="Code HTML de l'article..."
            spellcheck="false">
          </textarea>
        </div>
        
        <!-- Aperçu -->
        <div class="preview-panel" *ngIf="showPreview">
          <div class="article-preview" [innerHTML]="articleFormControl.value || articleContent"></div>
        </div>
      </div>
      
      <div class="editor-footer">
        <small class="text-muted">
          Caractères: {{ (articleFormControl.value || articleContent).length || 0 }} | 
          Mots: {{ getWordCount() }} |
          Mode: {{ showPreview ? 'Aperçu' : (showRawHtml ? 'HTML' : 'Visuel') }}
        </small>
      </div>
    </div>
  `,
  styles: [`
    .article-editor {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #ddd;
    }

    .editor-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }

    .editor-controls {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-info:hover {
      background: #138496;
    }

    .editor-content {
      min-height: 500px;
      display: flex;
      flex-direction: column;
    }

    .ngx-editor-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .raw-html-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .preview-panel {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #fafafa;
      border-top: 1px solid #ddd;
    }

    .article-textarea {
      flex: 1;
      border: none;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      resize: none;
      outline: none;
      background: white;
    }

    .article-preview {
      line-height: 1.6;
      color: #333;
    }

    .article-preview h4 {
      color: #2c5530;
      margin: 16px 0 8px 0;
      font-size: 18px;
    }

    .article-preview ul {
      background: #e8f5e8;
      padding: 8px 16px;
      border-left: 4px solid #4caf50;
      margin: 8px 0;
      font-style: italic;
    }

    .article-preview article {
      margin: 12px 0;
      text-align: justify;
    }

    .article-preview .myTooltip {
      color: #007bff;
      text-decoration: underline;
    }

    .article-preview .internal-image {
      margin: 16px 0;
      text-align: center;
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px;
    }

    .article-preview .internal-image img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: block;
      margin: 0 auto;
    }



    .editor-footer {
      padding: 12px 16px;
      background: #f8f9fa;
      border-top: 1px solid #ddd;
      text-align: right;
    }

    .text-muted {
      color: #6c757d;
    }
  `]
})
export class ArticleEditorComponent implements OnInit, OnDestroy {
  article = input<string>('');
  articleChange = output<string>();

  editor!: Editor;
  articleFormControl = new FormControl('');
  articleContent = '';
  showPreview = false;
  showRawHtml = false;

  toolbar: Toolbar = [
    ["bold", "italic"],
    ["underline", "strike"],
    ["code", "blockquote"],
    ["ordered_list", "bullet_list"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["link", "image"],
    ["text_color", "background_color"],
    ["align_left", "align_center", "align_right", "align_justify"],
  ];

  ngOnInit() {
    this.editor = new Editor();
    const initialContent = this.article() || '';
    this.articleContent = initialContent;
    this.articleFormControl.setValue(initialContent);
    
    // L'éditeur est activé par défaut
    // Si vous voulez le désactiver conditionnellement, utilisez :
    // this.articleFormControl.disable();
    // Pour le réactiver : this.articleFormControl.enable();
    
    // Synchroniser les changements du FormControl avec articleContent
    this.articleFormControl.valueChanges.subscribe(value => {
      this.articleContent = value || '';
    });
  }

  ngOnDestroy() {
    this.editor.destroy();
  }

  ngOnChanges() {
    const newContent = this.article() || '';
    this.articleContent = newContent;
    this.articleFormControl.setValue(newContent);
  }

  onSave() {
    const currentValue = this.articleFormControl.value || this.articleContent;
    this.articleChange.emit(currentValue);
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      this.showRawHtml = false;
    }
  }

  toggleRawHtml() {
    this.showRawHtml = !this.showRawHtml;
    if (this.showRawHtml) {
      this.showPreview = false;
    }
  }

  getWordCount(): number {
    const content = this.articleFormControl.value || this.articleContent;
    if (!content) return 0;
    return content
      .replace(/<[^>]*>/g, '') // Retirer les balises HTML
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }
}
