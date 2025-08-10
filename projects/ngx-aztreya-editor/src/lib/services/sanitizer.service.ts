import { Injectable } from '@angular/core';

// Try to use DOMPurify if installed (recommended):
// npm i dompurify
// and declare type: npm i --save-dev @types/dompurify
declare const DOMPurify: any;

@Injectable({ providedIn: 'root' })
export class SanitizerService {
  sanitize(html: string): string {
    try {
      // if DOMPurify is available globally (or via import), use it
      if (typeof DOMPurify !== 'undefined' && DOMPurify && DOMPurify.sanitize) {
        return DOMPurify.sanitize(html);
      }
    } catch (e) {
      // ignore and fallback
    }

    // Basic fallback sanitizer (very conservative): create element and strip script tags
    const div = document.createElement('div');
    div.innerHTML = html;
    // remove script and style elements
    const scripts = div.querySelectorAll('script, style');
    scripts.forEach((s) => s.remove());
    return div.innerHTML;
  }
}
