import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartdeliveryformComponent } from './cartdeliveryform.component';

describe('CartdeliveryformComponent', () => {
  let component: CartdeliveryformComponent;
  let fixture: ComponentFixture<CartdeliveryformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartdeliveryformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartdeliveryformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
