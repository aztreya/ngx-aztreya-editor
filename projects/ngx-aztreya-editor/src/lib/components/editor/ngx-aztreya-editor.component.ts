import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ControlValueAccessor, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SanitizerService } from '../../services/sanitizer.service';
import { EditorConfig } from '../../models/editor-config.model';

@Component({
  selector: 'ngx-aztreya-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ngx-aztreya-editor.component.html',
  styleUrls: ['./ngx-aztreya-editor.component.scss'],
})
export class NgxAztreyaEditorComponent
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
{
  @Input() config: EditorConfig = {};
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  // toolbar active states
  activeButtons: Record<string, boolean> = {
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: true, // default active
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    h5: false,
    h6: false,
    p: true,
  };

  // select value bound to heading; 'p' means Normal
  selectedHeading = 'p';

  // remember caret-only toggles (when selection collapsed)
  private caretFormats: Record<string, boolean> = {
    bold: false,
    italic: false,
    underline: false,
  };

  private defaultConfig: EditorConfig = {
    placeholder: 'Start typing...',
    showBold: true,
    showItalic: true,
    showUnderline: true,
    toolbarPosition: 'top',
    theme: 'light',
    initialValue: '',
    imageUpload: undefined,
    showToolbar: true,
  };

  finalConfig!: EditorConfig;

  @Output() contentChange = new EventEmitter<string>();

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};
  private destroyed = false;

  constructor(private sanitizer: SanitizerService) {}

  ngOnInit() {
    this.finalConfig = { ...this.defaultConfig, ...this.config };
  }

  ngAfterViewInit(): void {
    const el = this.editorRef.nativeElement;
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-multiline', 'true');
    el.innerHTML = this.finalConfig.initialValue || '<p><br></p>';
    el.addEventListener('input', this.onInput);
    el.addEventListener('blur', this.onTouched);

    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (e) {
      // ignore in browsers that don't support it
    }

    // update state initially and on selection change
    document.addEventListener('selectionchange', this.updateActiveStates);
    document.addEventListener('mouseup', this.updateActiveStates);
    document.addEventListener('keyup', this.updateActiveStates);
    el.addEventListener('focus', this.updateActiveStates);

    // initial update
    setTimeout(() => this.updateActiveStates(), 0);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    document.removeEventListener('selectionchange', this.updateActiveStates);
    document.removeEventListener('mouseup', this.updateActiveStates);
    document.removeEventListener('keyup', this.updateActiveStates);
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    const el = this.editorRef?.nativeElement;
    if (el) {
      el.innerHTML = value || '<p><br></p>';
    } else {
      this.finalConfig.initialValue = value || '';
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    const el = this.editorRef?.nativeElement;
    if (el) {
      el.setAttribute('contenteditable', (!isDisabled).toString());
    }
  }

  // ---------------- Toolbar actions ----------------

  exec(cmd: string, value?: string) {
    // apply command
    document.execCommand(cmd, false, value);
    this.emitChange();

    // if selection collapsed: toggle caretFormats for bold/italic/underline
    const sel = window.getSelection();
    const collapsed = sel ? sel.isCollapsed : true;
    if (collapsed && ['bold', 'italic', 'underline'].includes(cmd)) {
      this.caretFormats[cmd] = !this.caretFormats[cmd];
      this.activeButtons[cmd] = this.caretFormats[cmd];
    }

    // let the browser apply changes, then recalc
    requestAnimationFrame(() => this.updateActiveStates());
  }

  // heading select change handler
  onHeadingChange() {
    // selectedHeading contains 'p' or 'h1'..'h6'
    const tag = this.selectedHeading || 'p';
    document.execCommand('formatBlock', false, tag);
    this.emitChange();
    requestAnimationFrame(() => this.updateActiveStates());
  }

  // block toggle from <select> (kept for compatibility)
  toggleBlock(event: Event) {
    const tag =
      (event.target as HTMLSelectElement).value || this.selectedHeading || 'p';
    document.execCommand('formatBlock', false, tag);
    this.emitChange();
    requestAnimationFrame(() => this.updateActiveStates());
  }

  insertLink() {
    const url = prompt('Enter URL');
    if (!url) return;
    document.execCommand('createLink', false, url);
    this.emitChange();
    requestAnimationFrame(() => this.updateActiveStates());
  }

  setTextAlign(align: 'left' | 'center' | 'right' | 'justify') {
    const cmdMap: Record<string, string> = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull',
    };
    const cmd = cmdMap[align];
    if (cmd) {
      document.execCommand(cmd, false, '');
      this.emitChange();
      requestAnimationFrame(() => this.updateActiveStates());
    }
  }

  // ---------------- Helpers ----------------

  private insertHtmlAtCursor(html: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      this.editorRef.nativeElement.insertAdjacentHTML('beforeend', html);
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const el = document.createElement('div');
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while ((node = el.firstChild)) {
      frag.appendChild(node);
    }
    range.insertNode(frag);
    sel.collapseToEnd();
  }

  private onInput = (ev?: Event) => {
    // when user types, caretFormats are reflected into DOM; recompute states
    this.emitChange();
    requestAnimationFrame(() => this.updateActiveStates());
  };

  private emitChange = () => {
    if (this.destroyed) return;
    const html = this.editorRef.nativeElement.innerHTML || '';
    const sanitized = this.sanitizer.sanitize(html);
    this.onChange(sanitized);
    this.contentChange.emit(sanitized);
  };

  private escapeAttr(s: string) {
    return (s || '').replace(/"/g, '&quot;');
  }

  // update toolbar active state and selectedHeading
  private updateActiveStates = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // Check if selection is inside the editor
    const anchorNode = sel.anchorNode;
    if (!anchorNode) return;
    const isInsideEditor = this.editorRef.nativeElement.contains(anchorNode);
    if (!isInsideEditor) return; // Ignore events outside the editor

    // find a relevant element node from selection
    let node: Node | null = sel.anchorNode;
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    if (!node) return;
    let el = node as HTMLElement;

    // if inside inline element (strong/em), climb to nearest block container
    // find closest heading or paragraph/div
    const block = (el as HTMLElement).closest(
      'h1,h2,h3,h4,h5,h6,p,div,blockquote'
    ) as HTMLElement | null;
    const blockTag = block ? block.tagName.toLowerCase() : 'p';

    // HEADINGS
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(
      (h) => (this.activeButtons[h] = blockTag === h)
    );
    // normalize div -> p
    this.activeButtons['p'] = blockTag === 'p' || blockTag === 'div';
    this.selectedHeading = /^h[1-6]$/.test(blockTag) ? blockTag : 'p';

    // For inline formats prefer queryCommandState (works when selection non-collapsed)
    // but if selection collapsed use caretFormats (clicked style)
    const hasSelection = !sel.isCollapsed;
    if (hasSelection) {
      try {
        this.activeButtons['bold'] = document.queryCommandState('bold');
        this.activeButtons['italic'] = document.queryCommandState('italic');
        this.activeButtons['underline'] =
          document.queryCommandState('underline');
      } catch {
        // fallback to computed style if queryCommandState not available
        const computed = window.getComputedStyle(el);
        this.activeButtons['bold'] =
          computed.fontWeight === '700' || computed.fontWeight === 'bold';
        this.activeButtons['italic'] = computed.fontStyle === 'italic';
        this.activeButtons['underline'] = (
          computed.textDecorationLine || ''
        ).includes('underline');
      }
      // when selection exists, caretFormats should sync
      this.caretFormats['bold'] = this.activeButtons['bold'];
      this.caretFormats['italic'] = this.activeButtons['italic'];
      this.caretFormats['underline'] = this.activeButtons['underline'];
    } else {
      // collapsed caret: check queryCommandState (some browsers may return false),
      // fallback to caretFormats which we toggle on button clicks
      let qBold = false,
        qItalic = false,
        qUnderline = false;
      try {
        qBold = document.queryCommandState('bold');
        qItalic = document.queryCommandState('italic');
        qUnderline = document.queryCommandState('underline');
      } catch {}
      this.activeButtons['bold'] = qBold || this.caretFormats['bold'];
      this.activeButtons['italic'] = qItalic || this.caretFormats['italic'];
      this.activeButtons['underline'] =
        qUnderline || this.caretFormats['underline'];
    }

    // ALIGNMENT: prefer computed style from block element
    const computed = block
      ? window.getComputedStyle(block)
      : window.getComputedStyle(el);
    const textAlign = (computed.textAlign || 'left').toLowerCase();
    this.activeButtons['justifyLeft'] =
      textAlign === 'left' || textAlign === 'start';
    this.activeButtons['justifyCenter'] = textAlign === 'center';
    this.activeButtons['justifyRight'] = textAlign === 'right';
    this.activeButtons['justifyFull'] = textAlign === 'justify';
  };
}
