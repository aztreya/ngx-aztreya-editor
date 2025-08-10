import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxAztreyaEditorComponent } from './ngx-aztreya-editor.component';

describe('NgxAztreyaEditorComponent', () => {
  let component: NgxAztreyaEditorComponent;
  let fixture: ComponentFixture<NgxAztreyaEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxAztreyaEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxAztreyaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
