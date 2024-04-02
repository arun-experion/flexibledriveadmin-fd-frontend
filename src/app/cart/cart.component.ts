import {
  Component,
  Input,
  OnInit,
  AfterContentChecked,
  ViewChild
} from '@angular/core';

import {
  ApiService
} from '../services/api.service';

import {
  CARTAPI,
  TOASTRTIMEOUT
} from '../constant';

import {
  ProductlistService
} from '../services/productlist.service';

import {
  ToastrService
} from 'ngx-toastr';

import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import {
  ValidationService
} from '../services/validation.service';

import {
  Router
} from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ShowPriceService } from '../services/show-price.service';

import { NgbDatepickerConfig, NgbCalendar, NgbDate, NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [NgbDatepickerConfig]
})

export class CartComponent implements OnInit, AfterContentChecked {
  objectKeys = Object.keys;
  orderList = [];
  cartSubTotal: string;
  cartGST: string;
  cartDeliveryCharges: string;
  cartTotal: string;
  pickUpLocations = [];
  pickUpLocationAddress = '';
  pickUpLocationContact = '';
  orderListForDelivery = [];
  orderListForPickUp = [];
  orderPlaced = false;
  cartForm: FormGroup;
  deliveryForm: FormGroup;
  pickUpForm: FormGroup;
  stateList = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
  timeList = [];
  minDate = {};
  pickUpProductIDs: any = [];
  deliveryProductIDs: any = [];
  loading = false;
  messages = [];
  isOrderPlaceFailed = false;
  isOrderPlaced = false;
  order: any;
  currentUser: any;
  isCartSubmitDisabled = false;
  isPriceVisible = false;
  minimumOrderTimeGapInMinutes = 30;
  isSameDayOrder = false;
  postNineThrityDelivery = false;
  pickupTimeError = "";

  @Input() showCartDeliveryForm: boolean;
  @Input() showCartPickupForm: boolean;
  @Input() showCartPickupDeliveryForm: boolean;

  @ViewChild('cartBackOrderModal', { static: false }) cartBackOrderModal;
  carBackOrderPart: any;

  isDeliveryMethodSelected = true;
  isPickUpMethodSelected = false;
  isCartFormSubmited = false;
  productFromUserState = 0;
  productAvailableLocations = [];
  productInterStateAvailable = 0;

  private cartAPI = CARTAPI;
  private state = {
    "QLD": "Queensland Branch",
    "SA": "South Australia Branch",
    "TAS": "Tasmania Branch",
    "WA": "Western Australia Branch",
    "WHS": "Victoria Warehouse",
    "VIC": "Victoria Warehouse, Victoria Branch, VIC SOUTHERN DC, VIC NORTHERN DC"
  }

  constructor(
    private $apiSer: ApiService,
    private prodSer: ProductlistService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private authServ: AuthenticationService,
    private showPrice: ShowPriceService,
    config: NgbDatepickerConfig,
    calendar: NgbCalendar,
    private modal: NgbModal
  ) {
    this.authServ.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    const currentDate = new Date();

    config.minDate = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate()
    };

    config.maxDate = { year: 2099, month: 12, day: 31 };

    config.outsideDays = 'hidden';
    config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) >= 6;

    this.cartForm = this.fb.group({
      delivery_method: ['1', {
        validators: [
          Validators.required
        ],
      }]
    });

    this.pickUpForm = this.fb.group({
      first_name: [this.currentUser.first_name, {
        validators: [
          Validators.required,
        ]
      }],
      last_name: [this.currentUser.last_name, {
        validators: [
          Validators.required,
        ]
      }],
      mobile: [this.currentUser.mobile, {
        validators: [
          Validators.required,
        ]
      }],
      date: ['', {
        validators: [
          Validators.required,
        ]
      }],
      time: ['', {
        validators: [
          Validators.required,
        ]
      }],
      location: ['', {
        validators: [
          Validators.required,
        ]
      }],
      products: ['', {
        validators: [
          Validators.required,
        ]
      }]
    });

    this.deliveryForm = this.fb.group({
      first_name: [this.currentUser.first_name, {
        validators: [
          Validators.required,
        ]
      }],
      last_name: [this.currentUser.last_name, {
        validators: [
          Validators.required,
        ]
      }],
      company_name: [this.currentUser.company_name, {
        validators: [
          Validators.required,
        ]
      }],
      address_line1: [this.currentUser.address_line1, {
        validators: [
          Validators.required,
        ]
      }],
      address_line2: [this.currentUser.address_line2],
      state: [this.currentUser.state, {
        validators: [
          Validators.required,
        ]
      }],
      zip: [this.currentUser.zip, {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.pattern('[0-9]+')
        ]
      }],
      mobile: [this.currentUser.mobile, {
        validators: [
          Validators.required,
        ]
      }],
      email: [this.currentUser.email, {
        validators: [
          Validators.required,
          ValidationService.emailValidator
        ]
      }],
      products: ['', {
        validators: [
          Validators.required,
        ]
      }]
    });
  }

  ngOnInit() {
    this.showPrice.setPriceChangeDisabled(false);
    this.showPrice.isPriceVisible.subscribe(res => {
      this.isPriceVisible = res;
    });
    this.cartForm.addControl('delivery', this.deliveryForm);

    this.cartForm.controls.delivery_method.valueChanges.subscribe(val => {
      delete this.cartForm.controls.delivery;
      delete this.cartForm.controls.pickup;
      this.pickUpProductIDs = [];
      this.deliveryProductIDs = [];
      this.isCartFormSubmited = false;

      if (val === '1') {
        this.isDeliveryMethodSelected = true;
        this.isPickUpMethodSelected = false;

        this.cartForm.addControl('delivery', this.deliveryForm);
      }

      if (val === '2') {
        this.isDeliveryMethodSelected = false;
        this.isPickUpMethodSelected = true;

        this.cartForm.addControl('pickup', this.pickUpForm);
      }

      if (val === '3') {
        this.isDeliveryMethodSelected = true;
        this.isPickUpMethodSelected = true;

        this.cartForm.addControl('delivery', this.deliveryForm);
        this.cartForm.addControl('pickup', this.pickUpForm);
      }

    });

    const hours = ['09', '10', '11', '12', '13', '14', '15', '16' ];
    for (let i = 0; i < hours.length; i++) {
      for (let j = 0; j < 4; j++) {
        this.timeList.push(hours[i] + ':' + (j === 0 ? '00' : 15 * j));
      }
    }
    const currentDate = new Date();
    this.minDate = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      day: currentDate.getDate()
    };

    this.prodSer.cart.subscribe(cart => {
      let availableBranchIds = []
      this.productAvailableLocations = [];

      this.orderList = cart.data.items;
      // this.currentUser.state = 'QLD';
      this.productFromUserState = 0;
      this.orderList.forEach(item => {
        item.qty_with_location.forEach(branch => {
          if (this.state[this.currentUser.state].includes(branch.branch.name) && branch.qty >= item.qty) {
            this.productFromUserState++;
            if(!this.productAvailableLocations.includes(branch.branch) && availableBranchIds.includes(branch.branch.id) == false){
              availableBranchIds.push(branch.branch.id)
              this.productAvailableLocations.push(branch.branch)
            }
          }else{
            this.productInterStateAvailable++;
          }
        })
      })

      this.cartSubTotal = cart.data.subtotal;
      this.cartGST = cart.data.GST;
      this.cartDeliveryCharges = cart.data.delivery;
      this.cartTotal = cart.data.total;
      this.pickUpLocations = cart.data.location;
    });

    /**
     * If clide storage have any data related to re order.
     * following auto populate data in the form.
     */
    try {
      const { order: { delivery_method, delivery_info } } = JSON.parse(sessionStorage.getItem('reOrder'));

      try {
        /**
         * Need to have proper data from the back end, so we can use following line of code and remove induvidual assignment
         * this.cartForm.setValue(delivery)
         */
        const { delivery } = delivery_info;
        this.cartForm.controls.delivery_method.setValue(delivery_method);
        this.deliveryForm.controls.first_name.setValue(delivery.first_name)
        this.deliveryForm.controls.last_name.setValue(delivery.last_name)
        this.deliveryForm.controls.company_name.setValue(delivery.company_name)
        this.deliveryForm.controls.address_line1.setValue(delivery.address_line1)
        this.deliveryForm.controls.address_line2.setValue(delivery.address_line2)
        this.deliveryForm.controls.state.setValue(delivery.state)
        this.deliveryForm.controls.zip.setValue(delivery.zip)
        this.deliveryForm.controls.mobile.setValue(delivery.mobile)
        this.deliveryForm.controls.email.setValue(delivery.email)
        this.deliveryProductIDs = delivery.products;
      } catch (error) { }

      try {
        const { pickup } = delivery_info;
        this.pickUpForm.controls.first_name.setValue(pickup.first_name)
        this.pickUpForm.controls.last_name.setValue(pickup.last_name)
        this.pickUpForm.controls.mobile.setValue(pickup.mobile)
        this.pickUpForm.controls.location.setValue(pickup.pickup_location_id)
        this.pickUpProductIDs = pickup.products;
      } catch (error) { }

    } catch (error) { }
  }

  ngAfterContentChecked() {
    this.orderListForDelivery = JSON.parse(JSON.stringify(this.orderList));
    this.orderListForDelivery.forEach(el => {
      (this.pickUpProductIDs.indexOf(el.product.id) !== -1) ? el.product.disabled = true : el.product.disabled = false;
      (this.deliveryProductIDs.indexOf(el.product.id) !== -1) ? el.product.selected = true : el.product.selected = false;
    });

    this.orderListForPickUp = JSON.parse(JSON.stringify(this.orderList));
    this.orderListForPickUp.forEach(el => {
      (this.deliveryProductIDs.indexOf(el.product.id) !== -1) ? el.product.disabled = true : el.product.disabled = false;
      (this.pickUpProductIDs.indexOf(el.product.id) !== -1) ? el.product.selected = true : el.product.selected = false;
    });
  }

  updateDeliveryDate(){
    let withinHomeState = false;

    this.orderList.forEach(item => {
      item.qty_with_location.forEach(branch => {
        if( parseInt(branch.branch_id) === parseInt(this.pickUpForm.controls.location.value) ){
          if( branch.branch.state == this.currentUser.state){
            withinHomeState = true;
          }else{
            withinHomeState = false;
          }
        }
      })
    })

    const currentDate = new Date();
    let currentHours= currentDate.getHours();

    if( currentHours < 17 && currentHours > 9 ){
      if(parseInt(this.pickUpForm.controls.location.value) === 9999){
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate() + 1
        };

        this.minimumOrderTimeGapInMinutes = 24 * 60;
        this.isSameDayOrder = false;
      }else if( withinHomeState ){
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate()
        };
        this.minimumOrderTimeGapInMinutes = 30;
        this.isSameDayOrder = true;
      }else{
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate() + 1
        };
        this.minimumOrderTimeGapInMinutes = 24 * 60;
        this.isSameDayOrder = false;
      }
    }else if(currentHours > 17){
      if(parseInt(this.pickUpForm.controls.location.value) === 9999){
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate() + 2
        };
        this.minimumOrderTimeGapInMinutes = 24 * 60;
        this.isSameDayOrder = false;
      }else if( withinHomeState ){
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate() + 1
        };
        this.minimumOrderTimeGapInMinutes = 30;
        this.isSameDayOrder = true;
        this.postNineThrityDelivery = true;
      }else{
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate() + 2
        };
        this.minimumOrderTimeGapInMinutes = 24 * 60;
        this.isSameDayOrder = false;
      }
    }else if(currentHours < 9){
      if(parseInt(this.pickUpForm.controls.location.value) === 9999){
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate() + 1
        };
        this.minimumOrderTimeGapInMinutes = 24 * 60;
        this.isSameDayOrder = false;
      }else if( withinHomeState ){
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate()
        };
        this.minimumOrderTimeGapInMinutes = 30;
        this.isSameDayOrder = true;
        this.postNineThrityDelivery = true;
      }else{
        this.minDate = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate() + 1
        };
        this.minimumOrderTimeGapInMinutes = 24 * 60;
        this.isSameDayOrder = false;
      }
    }
  }

  validateDeliveryTime(){
    const scheduledTime = new Date(
      this.pickUpForm.controls.date.value["year"],
      this.pickUpForm.controls.date.value["month"] - 1,
      this.pickUpForm.controls.date.value["day"],
      this.pickUpForm.controls.time.value.split(":")[0],
      this.pickUpForm.controls.time.value.split(":")[1]
    )
    const currentDate = new Date();
    let currentHours= currentDate.getHours();
    let timeHasError = false;

    const scheduledDate = scheduledTime.getFullYear() + "-" + scheduledTime.getMonth() + "-" + scheduledTime.getDay();
    const orderDate = currentDate.getFullYear() + "-" + currentDate.getMonth() + "-" + currentDate.getDay();
    const orderNextDate = currentDate.getFullYear() + "-" + currentDate.getMonth() + "-" + ( currentDate.getDay() + 1 );
    if( scheduledDate === orderDate && scheduledTime.getHours() == 9 && scheduledTime.getMinutes() < 30){
      this.pickupTimeError = "Same day order can be scheduled for pickup after 9:30 AM.";
      timeHasError = true;
    }
    var timeDiff = Math.abs(currentDate.getTime() - scheduledTime.getTime()) / 60000;
    if(this.minimumOrderTimeGapInMinutes > timeDiff){
      this.pickupTimeError = "Order can be scheduled for pickup after 24 hours only.";
      timeHasError = true;
    }
    if(currentDate.getTime() > scheduledTime.getTime()){
      this.pickupTimeError = "Pickup time should not be less than current time.";
      timeHasError = true;
    }
    if(timeDiff < 30){
      this.pickupTimeError = "Please choose a time greater than 30 minutes from now.";
      timeHasError = true;
    }
    if( this.postNineThrityDelivery ){
      if(scheduledDate == orderNextDate && scheduledTime.getHours() == 9 && scheduledTime.getMinutes() < 30 ){
        this.pickupTimeError = "Pickup time should be after 9:30 AM.";
        timeHasError = true;
      }
    }
    if(timeHasError){
      this.pickUpForm.controls.time.setValue("");
    }else{
      this.pickupTimeError = "";
    }
  }

  onCartFormSubmit() {
    this.isCartFormSubmited = true;

    if (this.isDeliveryMethodSelected &&
      !(this.isDeliveryMethodSelected &&
        this.isPickUpMethodSelected)) {
      this.deliveryProductIDs = this.orderListForDelivery.map(el => el.product.id);
    }

    if (this.isPickUpMethodSelected &&
      !(this.isDeliveryMethodSelected &&
        this.isPickUpMethodSelected)) {
      this.pickUpProductIDs = this.orderListForPickUp.map(el => el.product.id);
    }

    this.deliveryForm.controls.products.setValue(this.deliveryProductIDs);
    this.pickUpForm.controls.products.setValue(this.pickUpProductIDs);

    if (this.cartForm.invalid ||
      (this.orderList.length !==
        (this.pickUpProductIDs.length + this.deliveryProductIDs.length))) {
      this.validateAllFormFields(this.cartForm);
      return;
    }

    try {
      // const date = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
      const { year, month, day } = this.pickUpForm.controls.date.value;
      this.cartForm.value.pickup.date = `${year}-${month}-${day}`;
    } catch (error) { }

    this.loading = true;
    this.isCartSubmitDisabled = true;

    this.$apiSer.post(
      `${this.cartAPI}/placeorder`,
      this.cartForm.value
    ).subscribe(res => {
      if (res.success) {
        this.toastr.success(`${res.message} Please add order reference number.`);
        this.isOrderPlaced = true;
        this.order = res.data;
        sessionStorage.removeItem('reOrder');
      } else {
        this.isOrderPlaceFailed = true;
        this.messages = res.data;
      }
    }, error => console.log(error), () => {
      this.loading = false;
      this.isCartSubmitDisabled = true;
    });
  }

  onCheckDelivery = (product) => {
    if (this.deliveryProductIDs.indexOf(product.id) === -1) {
      this.deliveryProductIDs.push(product.id);
    } else {
      this.deliveryProductIDs.splice(this.deliveryProductIDs.indexOf(product.id));
    }
  }

  onCheckPickUp = (product) => {
    if (this.pickUpProductIDs.indexOf(product.id) === -1) {
      this.pickUpProductIDs.push(product.id);
    } else {
      this.pickUpProductIDs.splice(this.pickUpProductIDs.indexOf(product.id));
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

  confirmOrder() {
    this.$apiSer.get(`${this.cartAPI}/placeorder`).subscribe(res => {
      if (res.success) {
        this.orderPlaced = true;
        this.toastr.success('Thank you for submitting the order. You will shortly receive a confirmation email.');
        this.orderList = this.prodSer.getCart().map(el => {
          el.addToCart = 0;
          el.quantity = 1;
        });
      }
    }, error => console.log(error), () => { });
  }

  addAsABackOrder() {
    this.modal.dismissAll();
    const {
      id: product_id,
      quantity: qty
    } = this.carBackOrderPart;

    if (qty < 100) {
      this.$apiSer.post(`${this.cartAPI}/add/product`, {
        product_id,
        qty: qty + 1
      }).subscribe(res => {
        if (res.success) {
          this.carBackOrderPart.quantity = qty + 1;
        }
      }, error => console.log(error), () => {
        this.prodSer.getCartItems();
      });
    }
  }
  cancelBackOrder() {
    console.log(this.carBackOrderPart)
    this.modal.dismissAll();
    this.carBackOrderPart.quantity = this.carBackOrderPart.qty;
    if (this.carBackOrderPart.quantity === 0) {
      this.decreseQuantityInCart(this.carBackOrderPart);
    } else {
      this.increseQuantityInCart(this.carBackOrderPart);
    }
  }
  increseQuantityInCart(product) {
    if (product.qty < product.quantity && product.isBackOrderModalShown === false) {
      product.isBackOrderModalShown = true;
      this.carBackOrderPart = product;
      this.modal.open(this.cartBackOrderModal, {
        backdrop: 'static',
        keyboard: false
      });
    } else {
      const {
        id: product_id,
        quantity: qty
      } = product;

      if (qty < 100) {
        this.$apiSer.post(`${this.cartAPI}/add/product`, {
          product_id,
          qty: qty + 1
        }).subscribe(res => {
          if (res.success) {
            product.quantity = qty + 1;
          }
        }, error => console.log(error), () => {
          this.prodSer.getCartItems();
        });
      }
    }

  }

  decreseQuantityInCart(product) {
    const {
      id: product_id,
      quantity: qty
    } = product;

    if (qty > 1) {
      this.$apiSer.post(`${this.cartAPI}/add/product`, {
        product_id,
        qty: qty - 1
      }).subscribe(res => {
        if (res.success) {
          product.quantity = qty - 1;
        }
      }, error => console.log(error), () => {
        this.prodSer.getCartItems();
      });
    } else {
      const indexOfProduct = this.orderList.indexOf(product);

      this.$apiSer.get(`${this.cartAPI}/${product_id}/remove`).subscribe(res => {
        if (res.success) {
          this.orderList.splice(indexOfProduct, 1);
        }
      }, error => console.log(error), () => {
        this.prodSer.getCartItems();
      });
    }
  }
}
