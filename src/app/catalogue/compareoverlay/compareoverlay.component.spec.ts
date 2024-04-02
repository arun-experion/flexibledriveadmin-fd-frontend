import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareoverlayComponent } from './compareoverlay.component';

describe('CompareoverlayComponent', () => {
  let component: CompareoverlayComponent;
  let fixture: ComponentFixture<CompareoverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompareoverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareoverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
