import { Component } from '@angular/core';
import { NgxAztreyaEditorComponent } from 'ngx-aztreya-editor';
import { EditorConfig } from '../../../ngx-aztreya-editor/src/public-api';

@Component({
  selector: 'app-root',
  imports: [NgxAztreyaEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'editor-demo';
  editorConfig: EditorConfig = {
    showToolbar: true,
    placeholder: 'Write something...',
    toolbarPosition: 'bottom',
  };
}
