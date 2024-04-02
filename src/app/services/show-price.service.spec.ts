import { TestBed } from '@angular/core/testing';

import { ShowPriceService } from './show-price.service';

describe('ShowPriceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShowPriceService = TestBed.get(ShowPriceService);
    expect(service).toBeTruthy();
  });
});
