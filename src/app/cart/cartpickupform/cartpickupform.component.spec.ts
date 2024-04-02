import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartpickupformComponent } from './cartpickupform.component';

describe('CartpickupformComponent', () => {
  let component: CartpickupformComponent;
  let fixture: ComponentFixture<CartpickupformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartpickupformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartpickupformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
