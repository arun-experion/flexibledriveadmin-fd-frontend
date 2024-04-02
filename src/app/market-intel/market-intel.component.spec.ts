import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketIntelComponent } from './market-intel.component';

describe('MarketIntelComponent', () => {
  let component: MarketIntelComponent;
  let fixture: ComponentFixture<MarketIntelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketIntelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketIntelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
