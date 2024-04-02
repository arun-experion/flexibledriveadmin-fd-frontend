import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductlistService } from 'src/app/services/productlist.service';
import { CompareService } from 'src/app/services/compare.service';
import { SESSIONSTORAGECOMPARELIST } from 'src/app/constant';


@Component({
  selector: 'app-compareoverlay',
  templateUrl: './compareoverlay.component.html',
  styleUrls: ['./compareoverlay.component.css']
})
export class CompareoverlayComponent implements OnInit {
  allProductData: any = [];
  compareProductList: any = [];
  @Input() closable = true;
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private Productlist: ProductlistService,
    private comSer: CompareService
  ) {
  }

  ngOnInit() {
    try {
      const { id } = JSON.parse(sessionStorage.getItem(SESSIONSTORAGECOMPARELIST));
      this.compareProductList = JSON.parse(sessionStorage.getItem(SESSIONSTORAGECOMPARELIST));
    } catch (error) { }

    this.comSer.subCompareListAndIDs.subscribe(el => {
      this.compareProductList = el[SESSIONSTORAGECOMPARELIST];
    })
  }

  getProducts() {
    this.compareProductList = this.Productlist.compareProductList;
  }

  removeProductFromCompare(part) {
    // console.log(part)
    this.comSer.addOrRemove(part);
  }

  removeAllCompare() {
    this.comSer.removeAll();
    this.compareProductList.forEach(el => {
      el.is_compare = 0;
    })
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

}
