import { Component, input, output, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxEditorModule],
  templateUrl: './article-editor.component.html',
  styleUrl: './article-editor.component.css'
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