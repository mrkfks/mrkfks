import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorArea } from './editor-area';

describe('EditorArea', () => {
  let component: EditorArea;
  let fixture: ComponentFixture<EditorArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorArea],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
