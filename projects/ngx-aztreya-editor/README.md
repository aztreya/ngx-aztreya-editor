# ngx-aztreya-editor

A lightweight, customizable **Angular Rich Text Editor** component with built-in toolbar, headings, text formatting, and alignment options — ready to drop into your Angular project.

## ✨ Features

- ✅ Bold, Italic, Underline
- ✅ Headings (H1–H6) and Paragraph
- ✅ Text alignment (Left, Center, Right, Justify)
- ✅ Toolbar positioning (`top` or `bottom`)
- ✅ Placeholder text
- ✅ Customizable configuration via `EditorConfig`
- ✅ Emits sanitized HTML content
- ✅ Works with Angular forms (`ControlValueAccessor`)

---

## 📦 Installation

```bash
npm install ngx-aztreya-editor
```


### Example code

#### component
``` 
import { Component } from '@angular/core';
import { NgxAztreyaEditorComponent } from 'ngx-aztreya-editor';
import { EditorConfig } from 'ngx-aztreya-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxAztreyaEditorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  editorConfig: EditorConfig = {
    showToolbar: true,
    placeholder: 'Write something...',
    toolbarPosition: 'bottom',
  };
}
```

#### html

Import google fonts in your `index.html` file:
``` bash
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..24,100..600,0..1,0..200&display=swap&icon_names=format_align_center,format_align_justify,format_align_left,format_align_right,format_bold,format_italic,format_list_numbered,format_underlined,list"
    />
```

```
<ngx-aztreya-editor [config]="editorConfig"></ngx-aztreya-editor>
```