import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartpickupdeliveryformComponent } from './cartpickupdeliveryform.component';

describe('CartpickupdeliveryformComponent', () => {
  let component: CartpickupdeliveryformComponent;
  let fixture: ComponentFixture<CartpickupdeliveryformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartpickupdeliveryformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartpickupdeliveryformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
