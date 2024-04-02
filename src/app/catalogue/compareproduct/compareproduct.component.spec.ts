import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareproductComponent } from './compareproduct.component';

describe('CompareproductComponent', () => {
  let component: CompareproductComponent;
  let fixture: ComponentFixture<CompareproductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompareproductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
