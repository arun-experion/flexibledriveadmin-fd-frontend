import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowPriceService {

  isPriceVisible: Subject<boolean> = new Subject<boolean>();
  isPriceChangeDisabled: Subject<boolean> = new Subject<boolean>();

  constructor() { }

  setShowPrice(priceVisible: boolean) {
    this.isPriceVisible.next(priceVisible);
  }

  setPriceChangeDisabled (isPriceDisabled: boolean) {
    this.isPriceChangeDisabled.next(isPriceDisabled)
  }
}
