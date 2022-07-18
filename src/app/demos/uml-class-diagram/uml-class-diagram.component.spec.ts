import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmlClassDiagramComponent } from './uml-class-diagram.component';

describe('UmlClassDiagramComponent', () => {
  let component: UmlClassDiagramComponent;
  let fixture: ComponentFixture<UmlClassDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UmlClassDiagramComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UmlClassDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
