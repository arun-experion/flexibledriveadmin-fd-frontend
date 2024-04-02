import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedPartsComponent } from './associated-parts.component';

describe('AssociatedPartsComponent', () => {
  let component: AssociatedPartsComponent;
  let fixture: ComponentFixture<AssociatedPartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociatedPartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedPartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
