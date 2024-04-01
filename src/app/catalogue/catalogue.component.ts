import { Component, Input, OnInit, HostListener, AfterContentChecked, ViewChild } from '@angular/core';
import { ProductlistService } from 'src/app/services/productlist.service';

import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import {
  PRODUCTSAPI,
  CATEGORIESAPI,
  BRANDSAPI,
  CARTAPI,
  SESSIONSTORAGECOMPARELIST,
  SESSIONSTORAGECOMPARELISTIDS,
  COMPAREOVERLAYTIMEOUT,
  POSITIONSAPI
} from '../constant';
import { Util } from '../utils/util';
import { ToastrService } from 'ngx-toastr';
import { ShowPriceService } from '../services/show-price.service';
import { CompareService } from '../services/compare.service';
import { AuthenticationService } from '../services/authentication.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit {
  brandData: any = [];
  productData: any = [];
  categoryData: any = [];
  positionData: any = [];
  compareProductList: any = [];
  compareProductListId: any = [];
  isNotAllowedCompare = false;
  perPageItemCount = 20;
  currentIndex = 1;
  nextPageUrl = '';
  brandId = 0;
  categoryId = 0;
  categoriesAPI = CATEGORIESAPI;
  brandsAPI = BRANDSAPI;
  isProductLoading = false;
  isPriceVisible = false;
  currentUser: any;
  userStateQty = 0;
  closeResult = '';

  @ViewChild('catalogueBackOrderModal', { static: false }) catalogueBackOrderModal;

  private productNr: string;
  private ishovering: boolean;
  private cartAPI = CARTAPI;
  private queryParams: any;
  private productAPI = PRODUCTSAPI;
  private currentPage = 0;
  private lastPage = 0;
  private isPaginationRequestContenu = false;
  private cartItemsIds = [];
  private casrtItemQty = [];
  private partAsABackOrder: any;
  private state = {
    "ACT": "ACT Silo",
    "NSW": "NSW Branch",
    "QLD": "Queensland Branch",
    "SA" : "South Australia Branch",
    "TAS": "Tasmania Branch",
    //"VIC": "Victoria Branch",
    "WA" : "Western Australia Branch",
    "VIC": "Victoria Warehouse, Victoria Branch, VIC SOUTHERN DC, VIC NORTHERN DC"
  }

  @Input() visible = false;

  constructor(
    private Productlist: ProductlistService,
    private route: ActivatedRoute,
    private $apiSer: ApiService,
    private toastr: ToastrService,
    private showPrice: ShowPriceService,
    private comSer: CompareService,
    private authSer: AuthenticationService,
    private modal: NgbModal,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.queryParams = params;
    });
    this.authSer.currentUser.subscribe(user => {
      this.currentUser = user;
      // console.log(user)
    })
  }

  ngOnInit() {
    this.getBrands();
    this.getCategory();
    this.getAllProducts();
    this.getFittingPosition();

    this.showPrice.setPriceChangeDisabled(false);

    this.showPrice.isPriceVisible.subscribe(res => {
      this.isPriceVisible = res;
    });

    this.comSer.subCompareListAndIDs.subscribe(el => {
      this.compareProductList = el[SESSIONSTORAGECOMPARELIST];
      this.compareProductListId = el[SESSIONSTORAGECOMPARELISTIDS]
      if (el[SESSIONSTORAGECOMPARELIST].length > 0 && this.visible === false) {
        this.visible = true
      }
      this.productData.forEach(el => {
        if (this.compareProductListId.indexOf(el.id) !== -1) {
          el.is_compare = 1;
        } else {
          el.is_compare = 0;
        }
      })
    });

    const { compareList, compareListIDs } = this.comSer.getSub();
    this.compareProductList = compareList;
    this.compareProductListId = compareListIDs;
    if (this.compareProductList.length > 0 && this.visible === false) {
      setTimeout(() => {
        this.visible = true;
      }, COMPAREOVERLAYTIMEOUT)
    }

  }

  getCart() {
    this.$apiSer.get(`${this.cartAPI}/items`).subscribe(res => {
      if (res.success) {
        res.data.items.forEach(el => {
          const { product_id, qty } = el;
          this.cartItemsIds.push(product_id);
          this.casrtItemQty.push(qty);
        });
      }
    }, error => console.log(error), () => { });
  }

  getNextPageProductData(url) {
    if (this.currentPage !== this.lastPage && !this.isPaginationRequestContenu) {
      this.isPaginationRequestContenu = true;
      this.isProductLoading = true;
      const queryParamObj = Object.assign({}, this.queryParams);

      queryParamObj.brand_id = this.brandId;
      queryParamObj.category_id = this.categoryId;
      queryParamObj.per_page = 20;
      queryParamObj.product_nr = queryParamObj.product_nr ? queryParamObj.product_nr.trim() : '';

      const queryString = Util.objectToQueryString(queryParamObj);

      this.$apiSer.getNoBaseUrl(`${url}&${queryString}`)
        .subscribe(res => {
          if (res.success) {
            this.currentPage = res.data.current_page;
            this.nextPageUrl = res.data.next_page_url;
            res.data.data.forEach(objProductRow => {
              const indexInCart = this.cartItemsIds.indexOf(objProductRow.id);
              const compIDsidx = this.compareProductListId.indexOf(objProductRow.id);
              objProductRow.is_compare = (compIDsidx !== -1) ? 1 : 0;
              objProductRow.quantity = (indexInCart !== -1) ? this.casrtItemQty[indexInCart] : 1;
              objProductRow.addToCart = (indexInCart !== -1) ? 1 : 0;
              objProductRow.quantityCurrentUserState = []
              objProductRow.isBackOrderModalShown = false;
              objProductRow.qty_with_location = [];
              objProductRow.currentUserStateQty = 0
              objProductRow.qty_with_location.forEach(branch => {
                if (this.state[this.currentUser.state].include(branch.branch.name) ) {
                  objProductRow.quantityCurrentUserState.push({'state': this.currentUser.state, 'qty': branch.qty} );
                  objProductRow.currentUserStateQty += branch.qty;
                }
              });
              this.productData.push(objProductRow);
            });

            // this.compareProductList = this.Productlist.compareProductList;
            this.Productlist.updateProductList(this.productData);
          } else {

          }

        }, error => console.log(error), () => {
          this.isProductLoading = false;
          this.isPaginationRequestContenu = false;
        });
    } else {
      console.log(`Pagination is completed.`);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      if (this.nextPageUrl && this.nextPageUrl !== '') {
        this.getNextPageProductData(this.nextPageUrl);
      }
    }
  }

  getBrands() {
    const queryString = Util.objectToQueryString(this.queryParams);
    this.$apiSer.get(`${this.brandsAPI}?${queryString}`)
      .subscribe(res => {
        if (res.success) {
          this.brandData = res.data;
        }
      }, error => console.log(error), () => { });
  }

  getCategory() {
    const queryString = Util.objectToQueryString(this.queryParams);
    this.$apiSer.get(`${this.categoriesAPI}?${queryString}`).subscribe(res => {
      if (res.success) {
        this.categoryData = res.data;
      }
    }, error => console.log(error), () => { });
  }

  getFittingPosition() {
    const queryString = Util.objectToQueryString(this.queryParams);
    this.$apiSer.get(`${POSITIONSAPI}?${queryString}`).subscribe(res => {
      if (res.success) {
        this.positionData = res.data;
      }
    },
      error => console.log(error), () => { })
  }

  getAllProducts(BrandID = 0, CatId = 0) {

    this.isProductLoading = true;
    this.brandId = BrandID;
    this.categoryId = CatId;
    this.productData = [];

    const queryParamObj = Object.assign({}, this.queryParams);

    queryParamObj.brand_id = this.brandId;
    queryParamObj.category_id = this.categoryId;
    queryParamObj.page = 1;
    queryParamObj.per_page = 20;
    queryParamObj.product_nr = queryParamObj.product_nr ? queryParamObj.product_nr.trim() : '';

    const queryString = Util.objectToQueryString(queryParamObj);
    this.$apiSer.get(`${this.productAPI}?${queryString}`)
      .subscribe(res => {
        if (res.success) {
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
          this.nextPageUrl = res.data.next_page_url;
          this.productData = res.data.data || res.data;
          this.productData.forEach(objProductRow => {
            const indexInCart = this.cartItemsIds.indexOf(objProductRow.id);
            const indexInCompareList = this.compareProductListId.indexOf(objProductRow.id);
            objProductRow.is_compare = (indexInCompareList !== -1) ? 1 : 0;
            objProductRow.quantity = (indexInCart !== -1) ? this.casrtItemQty[indexInCart] : 1;
            objProductRow.addToCart = (indexInCart !== -1) ? 1 : 0;
            objProductRow.quantityCurrentUserState = []
            objProductRow.currentUserStateQty = 0
            objProductRow.isBackOrderModalShown = false;
            objProductRow.qty_with_location.forEach(branch => {
              if (this.state[this.currentUser.state].includes(branch.branch.name) && branch.qty != 0 ) {
                objProductRow.quantityCurrentUserState.push({'state': branch.branch.name, 'qty': branch.qty} );
                objProductRow.currentUserStateQty += branch.qty;
              }
            });
          });
          this.Productlist.updateProductList(this.productData);
        }
      }, error => console.log(error), () => {
        this.isProductLoading = false;
        window.scrollTo(0, 0);
      });
  }

  onCompareChange(part) {
    this.comSer.addOrRemove(part)
  }

  changeVisible($event) {
    this.visible = $event;
  }

  addToCart(objProduct) {
    const { id: product_id, quantity: qty } = objProduct;
    this.$apiSer.post(`${this.cartAPI}/add/product`, {
      product_id,
      qty
    }).subscribe(res => {
      if (res.success) {
        objProduct.addToCart = 1;
        this.Productlist.updateProductList(this.productData);
        this.toastr.success(`${objProduct.product_nr} is added in the cart.`);
      } else {
        this.toastr.warning(`${res.message}`);
      }
    }, error => console.log(error), () => {
      this.Productlist.getCartItems();
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

  open(content) {
    this.modal.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }

  quantityIncrement(objProduct) {
    if (objProduct.qty <= objProduct.quantity && objProduct.isBackOrderModalShown === false) {
      objProduct.isBackOrderModalShown = true;
      this.partAsABackOrder = objProduct;
      this.modal.open(this.catalogueBackOrderModal, {
        backdrop: 'static',
        keyboard: false
      });
    } else {
      objProduct.quantity += 1;
    }
  }

  addAsABackOrder() {
    this.partAsABackOrder.quantity += 1;
    this.modal.dismissAll();
  }

  cancelBackOrder(){
    this.partAsABackOrder.quantity = this.partAsABackOrder.qty;
    this.modal.dismissAll();
  }

  quantityDecrement(objProduct) {
    objProduct.quantity !== 1 ? objProduct.quantity = objProduct.quantity - 1 : objProduct.quantity = 1;
  }

  filters(items) {
    return items.filter(x => x.product_count);
  }

  filterPosition(position: string) {
    this.queryParams = { fitting_position: position, ...this.queryParams };
    this.getAllProducts();
    // this.router.navigate(['/catalogue'], {queryParams: param});
    // this.ngOnInit();
  }
}
