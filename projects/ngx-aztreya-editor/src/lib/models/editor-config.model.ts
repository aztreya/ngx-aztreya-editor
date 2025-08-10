export interface EditorConfig {
  placeholder?: string;
  showToolbar?: boolean;
  showBold?: boolean;
  showItalic?: boolean;
  showUnderline?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  theme?: 'light' | 'dark';
  initialValue?: string;
  imageUpload?: (file: File) => Promise<string>;
}
