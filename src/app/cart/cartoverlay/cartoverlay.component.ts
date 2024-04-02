import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';

import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

import {
  ProductlistService
} from 'src/app/services/productlist.service';

import {
  ApiService
} from 'src/app/services/api.service';

import {
  CARTAPI
} from '../../constant';

import {
  Subscription
} from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ShowPriceService } from 'src/app/services/show-price.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cartoverlay',
  templateUrl: './cartoverlay.component.html',
  styleUrls: ['./cartoverlay.component.css'],
  animations: [
    trigger('cartoverlay', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ]
})

export class CartoverlayComponent implements OnInit {
  productData: any = [];
  productCartData: any = [];
  cartProductCount = 0;
  isPriceVisible = false;

  @Input() closable = true;
  @Input() visible: boolean;

  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('cartOverlayBackOrderModal', { static: false }) cartOverlayBackOrderModal;
  cartOverlayBackOrderPart: any;

  private cartAPI = CARTAPI;

  constructor(
    private Productlist: ProductlistService,
    private $apiSer: ApiService,
    private router: Router,
    private location: Location,
    private toastr: ToastrService,
    private showPrice: ShowPriceService,
    private moda: NgbModal
  ) {
    this.Productlist.cart.subscribe(cart => {
      this.productCartData = cart.data.items;
      this.cartProductCount = cart.data.items.length;
      this.Productlist.chnageCartItemCount(this.cartProductCount);
    });
  }

  ngOnInit() {
    this.Productlist.getCartItems();

    this.showPrice.isPriceVisible.subscribe(res => {
      this.isPriceVisible = res;
    });
  }

  onQuantityChange(objProduct) {
    if (objProduct.quantity > 100) {
      objProduct.quantity = 100;
    } else if (objProduct.quantity < 1) {
      objProduct.quantity = 1;
      objProduct.addToCart = 0;
    }
    this.Productlist.updateProductList(this.productData);
  }
  addAsABackOrder() {
    this.moda.dismissAll();
    const { id: product_id, quantity: qty } = this.cartOverlayBackOrderPart;

      if (qty <= 100) {
        this.$apiSer.post(`${this.cartAPI}/add/product`, {
          product_id,
          qty: qty + 1
        }).subscribe(res => {
          if (res.success) {
            this.cartOverlayBackOrderPart.quantity += 1;
            this.Productlist.updateProductList(this.productData);
          }
        }, error => console.log(error), () => {
          this.Productlist.getCartItems();
        });
      }
  }

  cancelBackOrder(){
    this.cartOverlayBackOrderPart.quantity = this.cartOverlayBackOrderPart.qty;
    if (this.cartOverlayBackOrderPart.quantity === 0) {
      this.quantityDecrement(this.cartOverlayBackOrderPart);
    } else {
      this.quantityIncrement(this.cartOverlayBackOrderPart);
    }
    this.moda.dismissAll();
  }
  quantityIncrement(objProduct) {
    if (objProduct.qty < objProduct.quantity && objProduct.isBackOrderModalShown === false) {
      objProduct.isBackOrderModalShown = true;
      this.moda.open(this.cartOverlayBackOrderModal, {
        backdrop: 'static',
        keyboard: false
      });
      this.cartOverlayBackOrderPart = objProduct;
    } else {
      const { id: product_id, quantity: qty } = objProduct;

      if (qty <= 100) {
        this.$apiSer.post(`${this.cartAPI}/add/product`, {
          product_id,
          qty: qty + 1
        }).subscribe(res => {
          if (res.success) {
            objProduct.quantity += 1;
            this.Productlist.updateProductList(this.productData);
          }
        }, error => console.log(error), () => {
          this.Productlist.getCartItems();
        });
      }
    }
  }

  quantityDecrement(objProduct) {
    const { id: product_id, quantity: qty } = objProduct;

    if (qty > 1) {
      this.$apiSer.post(`${this.cartAPI}/add/product`, {
        product_id,
        qty: qty - 1
      }).subscribe(res => {
        if (res.success) {
          objProduct.quantity -= 1;
          this.Productlist.updateProductList(this.productData);
        }
      }, error => console.log(error), () => {
        this.Productlist.getCartItems();
      });
    } else {
      this.removeFromCart(objProduct);
    }
  }

  removeFromCart(objProduct) {
    this.$apiSer.get(`${this.cartAPI}/${objProduct.id}/remove`).subscribe(res => {
      if (res.success) {
        objProduct.quantity = 1;
        objProduct.addToCart = 0;
        this.toastr.warning(`you have removed ${objProduct.company_sku} from the cart`);
      } else {
        this.toastr.warning(`${res.message}`);
      }
    }, error => console.log(error), () => {
      this.Productlist.getCartItems();
    });
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  addMore() {
    this.close()
    if (this.router.url.match('catalogue') === null) {
      this.router.navigate(['dashboard']);
    }
  }

  back() {
    this.location.back();
  }
}
