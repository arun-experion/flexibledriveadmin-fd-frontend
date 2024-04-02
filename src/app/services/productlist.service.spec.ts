import { TestBed } from '@angular/core/testing';

import { ProductlistService } from './productlist.service';

describe('ProductlistService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProductlistService = TestBed.get(ProductlistService);
    expect(service).toBeTruthy();
  });
});
