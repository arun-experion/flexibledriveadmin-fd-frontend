import { Component, OnInit, Input } from '@angular/core';
import { ProductlistService } from 'src/app/services/productlist.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CARTAPI, COMPAREOVERLAYTIMEOUT } from '../constant';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import {
  NOTEAPI,
  SESSIONSTORAGECOMPARELIST,
  SESSIONSTORAGECOMPARELISTIDS
} from '../constant';
import { Location } from '@angular/common';
import { ShowPriceService } from '../services/show-price.service';
import { CompareService } from '../services/compare.service';

@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {
  ProductId: number;
  productData: any = [];
  productDetail: any = {};
  nextPageUrl: string = '';
  brandId: number = 0;
  ProductImages: any = [];
  selectedProductImage: any;
  compareProductList: any = [];
  compareProductListIDs = []
  isNotAllowedCompare: boolean = false;
  userid: any;
  isNoteFormSubmoted = false;
  loading = false;
  user: any;
  currentUser: any;
  availableInterState= false;
  availableIntraState= false;
  interStateQuantity = 0;
  isPriceVisible = false;
  @Input() visible = false;
  private cartAPI = CARTAPI;
  private state = {
    "ACT": "ACT Silo",
    "NSW": "NSW Branch",
    "QLD": "Queensland Branch",
    "SA" : "South Australia Branch",
    "TAS": "Tasmania Branch",
    "VIC": "Victoria Branch, Victoria Warehouse, VIC SOUTHERN DC, VIC NORTHERN DC",
    "WA" : "Western Australia Branch"
  }

  noteForm: FormGroup;
  isLow: boolean;

  constructor(
    private route: ActivatedRoute,
    private Productlist: ProductlistService,
    private $apiSer: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authServ: AuthenticationService,
    private location: Location,
    private showPrice: ShowPriceService,
    private comSer: CompareService
  ) {
    this.authServ.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.userid = user.id;
        this.user = user;
      }
    });
    // console.log(this.route.snapshot.paramMap.get('id'))
    this.noteForm = this.fb.group({
      product: [this.route.snapshot.paramMap.get('id'), {}],
      user_id: [this.userid, {}],
      description: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2)
        ]
      }],
    });
    this.isLow = true;
  }

  onSubmitNoteForm() {
    this.isNoteFormSubmoted = true;
    if (this.noteForm.valid) {
      this.loading = true;
      this.$apiSer.post(`${NOTEAPI}`, this.noteForm.value).subscribe(res => {
        if (res.success) {
          this.toastr.success(res.message);
          this.productDetail.notes.push(res.data);
          this.noteForm.controls.description.setValue('');
          this.isNoteFormSubmoted = false;
        } else {
          this.toastr.warning(res.message)
        }
      }, error => console.log(error), () => {
        this.loading = false;
      });
    } else {
      this.validateAllFormFields(this.noteForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  ngOnInit() {

    this.ProductId = parseInt(this.route.snapshot.paramMap.get('id'));
    this.getProductDetail();

    this.showPrice.setPriceChangeDisabled(false);

    this.showPrice.isPriceVisible.subscribe(res => {
      this.isPriceVisible = res;
    });

    this.comSer.subCompareListAndIDs.subscribe(el => {
      this.compareProductList = el[SESSIONSTORAGECOMPARELIST];
      this.compareProductListIDs = el[SESSIONSTORAGECOMPARELISTIDS]
      if (el[SESSIONSTORAGECOMPARELIST].length > 1) {
        this.visible = true
      }
      this.productData.forEach(el => {
        if (this.compareProductListIDs.indexOf(el.id) !== -1) {
          el.is_compare = 1;
        } else {
          el.is_compare = 0;
        }
      })
    });
    const { compareList, compareListIDs } = this.comSer.getSub();
    this.compareProductList = compareList;
    this.compareProductListIDs = compareListIDs;
    if (this.compareProductList.length > 0 && this.visible === false) {
      setTimeout(() => {
        this.visible = true;
      }, COMPAREOVERLAYTIMEOUT)
    }
  }

  getProductDetail() {
    return this.Productlist.getProductDetail(this.ProductId)
      .subscribe((response: { success: any, data: any }) => {
        this.productDetail = response.data;

        this.productDetail.qty_with_location.forEach(branch => {
          if (this.state[this.currentUser.state].includes(branch.branch.name) && branch.qty > 0) {
            this.availableIntraState = true;
          }else if(branch.qty > 0){
            this.availableInterState = true;
            this.interStateQuantity = this.interStateQuantity + branch.qty;
          }
        });
        this.productDetail.quantity = 1;
        this.productDetail.addToCart = 0;
        const indexIntheCompareList = this.compareProductListIDs.indexOf(this.productDetail.id);
        this.productDetail.is_compare = (indexIntheCompareList !== -1) ? 1 : 0;

        this.ProductImages = this.productDetail.images;
        this.selectedProductImage = this.productDetail.images.length ? this.productDetail.images[0] : '';
        this.productData.push(this.productDetail);
        response.data.associated_parts.forEach(el => {
          el.quantity = 1;
          el.addToCart = 0;
          const indxAssociatedPart = this.compareProductListIDs.indexOf(el.id);
          el.is_compare = (indxAssociatedPart !== -1) ? 1 : 0;
        });
      });

  }

  addToCart(objProduct) {
    const { id: product_id, addToCart: isItInTheCart, quantity: qty } = objProduct;
    if (!isItInTheCart) {
      this.$apiSer.post(`${this.cartAPI}/add/product`, {
        product_id,
        qty
      }).subscribe(res => {
        if (res.success) {
          // this.toastr.success('Product is added.');
          objProduct.addToCart = 1;
          this.productData.push(this.productDetail);
          this.Productlist.updateProductList(this.productData);
          this.toastr.success(`${objProduct.company_sku} is added in the cart.`);
        }
      }, error => console.log(error), () => {
        this.Productlist.getCartItems();
      });
    }
  }

  quantityIncrement(objProduct) {
    const { id: product_id, addToCart: isItInTheCart, quantity: qty } = objProduct;
    if (isItInTheCart) {
      this.$apiSer.post(`${this.cartAPI}/add/product`, {
        product_id,
        qty: qty + 1
      }).subscribe(res => {
        if (res.success) {
          objProduct.quantity = qty + 1;
          const indexProduct = this.productData.findIndex((r) => r.id === objProduct.id);
          this.productData[indexProduct].quantity = objProduct.quantity;
          this.toastr.success(`you have increased quantity, which is ${qty + 1} for ${objProduct.company_sku}`);
        }
      }, error => console.log(error), () => {
        this.Productlist.getCartItems();
      });
    } else {
      objProduct.quantity += 1;
    }
  }

  quantityDecrement(objProduct) {
    const { id: product_id, addToCart: isItInTheCart, quantity: qty } = objProduct;
    if (isItInTheCart && qty > 1) {
      this.$apiSer.post(`${this.cartAPI}/add/product`, {
        product_id,
        qty: qty - 1
      }).subscribe(res => {
        if (res.success) {
          const indexProduct = this.productData.findIndex((r) => r.id === objProduct.id);
          this.productData[indexProduct].quantity = qty - 1;
          this.toastr.success(`you have decreased quantity, which is ${qty + 1} for ${objProduct.company_sku}`);
        }
      }, error => console.log(error), () => {
        this.Productlist.getCartItems();
      });
    } else {
      objProduct.quantity !== 1 ? objProduct.quantity = objProduct.quantity - 1 : objProduct.quantity = 1;
    }
  }

  onCompareChange(part) {
    this.comSer.addOrRemove(part);
  }

  changeVisible($event) {
    this.visible = $event;
  }

  back() {
    this.location.back();
  }

  selectImage(img: any) {
    this.selectedProductImage = img;
  }

  showPreview() {
    this.isLow = false;
  }

  hidePreview() {
    this.isLow = true;
  }
}
