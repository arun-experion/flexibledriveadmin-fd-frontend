import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartoverlayComponent } from './cartoverlay.component';

describe('CartoverlayComponent', () => {
  let component: CartoverlayComponent;
  let fixture: ComponentFixture<CartoverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartoverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartoverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
