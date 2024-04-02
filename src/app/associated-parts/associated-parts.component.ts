import { Component, OnInit, Input } from '@angular/core';
import { ShowPriceService } from '../services/show-price.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { CARTAPI, SESSIONSTORAGECOMPARELIST, SESSIONSTORAGECOMPARELISTIDS } from '../constant';
import { ProductlistService } from '../services/productlist.service';
import { CompareService } from '../services/compare.service';

@Component({
  selector: 'app-associated-parts',
  templateUrl: './associated-parts.component.html',
  styleUrls: ['./associated-parts.component.css']
})
export class AssociatedPartsComponent implements OnInit {

  @Input() parts = [];
  isPriceVisible = true;

  constructor(
    private showPrice: ShowPriceService,
    private toastrSer: ToastrService,
    private $apiSer: ApiService,
    private productService: ProductlistService,
    private comSer: CompareService
  ) {
  }

  ngOnInit() {
    this.showPrice.isPriceVisible.subscribe(val => {
      this.isPriceVisible = val;
    });

    this.comSer.subCompareListAndIDs.subscribe(el => {
      const compareProductListIDs = el[SESSIONSTORAGECOMPARELISTIDS]
      this.parts.forEach(el => {
        if (compareProductListIDs.indexOf(el.id) !== -1) {
          el.is_compare = 1;
        } else {
          el.is_compare = 0;
        }
      })
    });

  }

  quantityDecrement = (part) => {
    part.quantity > 1 ? part.quantity = part.quantity - 1 : part.quantity = 1;
  }

  quantityIncrement = (part) => {
    part.quantity <= 100 ? part.quantity = part.quantity + 1 : part.quantity = part.quantity;
  }

  addToCart = (part) => {
    const { id: product_id, quantity: qty } = part;

    this.$apiSer.post(`${CARTAPI}/add/product`, {
      qty,
      product_id
    }).subscribe(res => {
      if (res.success) {
        part.addToCart = 1;
        this.toastrSer.success(`${part.company_sku} is added in the cart.`);
      } else {
        this.toastrSer.warning(`${res.message}`);
      }
    }, error => console.log(error), () => {
      this.productService.getCartItems();
    });
  }

  onCompareChange = (part) => {
    this.comSer.addOrRemove(part);
  }

}
