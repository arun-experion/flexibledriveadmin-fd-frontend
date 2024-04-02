import { Component, Input, OnInit, AfterContentChecked, OnDestroy } from '@angular/core';
import { ProductlistService } from 'src/app/services/productlist.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Subscription } from 'rxjs';
import { ShowPriceService } from 'src/app/services/show-price.service';

import {
  ApiService
} from '../../services/api.service';

import {
  USERISACTIVEAPI
} from '../../constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit, AfterContentChecked, OnDestroy {
  productData: any = [];
  cartProductCount = 0;
  currentUser: any;
  currentUserSubscription: Subscription;
  cartItemCount = 0;
  isShowPriceChecked = true;
  isPriceChangeDisabled = true;
  private userIsActiveAPI: string = USERISACTIVEAPI;

  @Input() showCartoverlay: boolean;

  constructor(
    private Productlist: ProductlistService,
    private authServ: AuthenticationService,
    private showPrice: ShowPriceService,
	private router: Router,
	private $apiServ: ApiService,
  ) {
    this.currentUserSubscription = this.authServ.currentUser.subscribe(user => {
      this.currentUser = user;
    });
	
	this.$apiServ.post(this.userIsActiveAPI, JSON.stringify({'id': this.currentUser.id}))
	.subscribe(res => {
	  if (res && res.success) {
		if(res.data != 1) {
			this.authServ.logout();
			sessionStorage.setItem('inactiveUserMesage', 'Account is disabled.');
			this.router.navigate(['/login']);
		}
	  }
	}, error => {
	  console.log(error);
	});
    this.Productlist.changeCartItem.subscribe(val => {
      this.cartItemCount = val;
    });

    this.showPrice.isPriceChangeDisabled.subscribe(res => {
      this.isPriceChangeDisabled = res;
    });
    
    this.showPrice.isPriceVisible.subscribe(res => {
      this.isShowPriceChecked = res;
    });
  }

  ngOnInit() {
    this.productData = this.Productlist.getCart();
    sessionStorage.setItem('priceShow', this.isShowPriceChecked.toString());
    this.showPrice.setShowPrice(JSON.parse(sessionStorage.getItem('priceShow')));
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  ngAfterContentChecked() {
    this.getCartProducts();
  }

  getCartProducts() {
    this.productData = [];
    this.productData = this.Productlist.getCart();
    this.cartProductCount = 0;
    if(this.productData && Array.isArray(this.productData)){
      this.productData.forEach(objProductRow => {
        if (objProductRow.addToCart > 0) {
          this.cartProductCount = this.cartProductCount + 1;
        }
      });
    } else if(!Array.isArray(this.productData)){
      const productDataArray: Array<[string, any]> = Object.entries(this.productData);
      productDataArray.forEach(objProductRow => {
        if (objProductRow['addToCart'] > 0) {
          this.cartProductCount = this.cartProductCount + 1;
        }
      });
    }
  }

  priceToggle(ev) {
    sessionStorage.setItem('priceShow', ev.target.checked);
    this.showPrice.setShowPrice(ev.target.checked);
  }

  opencartpopup() {
  }
}
