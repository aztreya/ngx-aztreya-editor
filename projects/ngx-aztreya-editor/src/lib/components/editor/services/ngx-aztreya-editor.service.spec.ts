import { TestBed } from '@angular/core/testing';
import { NgxAztreyaEditorService } from './ngx-aztreya-editor.service';

describe('NgxAztreyaEditorService', () => {
  let service: NgxAztreyaEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxAztreyaEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
