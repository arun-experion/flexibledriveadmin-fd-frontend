import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ORDERSAPI, EXPORORDERS, BULKDELETE, ORDERAPI, FAVOURITEAPI, CARTAPI, TOASTRTIMEOUT, BULKCARTADDAPI } from '../constant';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environments/environment';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ValidationService } from '../services/validation.service';
import { ProductlistService } from '../services/productlist.service';
import { Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

const { baseUrl } = env;

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  @ViewChild('orderCancel', { static: false }) orderCancel;
  @ViewChild('orderDelete', { static: false }) orderDelete;
  includes = Array.prototype.includes;

  isCheckedAll = false;
  selectedOrders: any[] = [];
  orders = [];
  nextPageUrl = '';
  isPagination = true;
  orderSearchForm: FormGroup;
  isOrderSearchSubmit = false;
  searchAsAText = '';
  selectedOrder: any;
  loading = true;
  orderToCancel: any;
  searchParamAsString = '';

  stockOrder = [];
  private activeTab = 1;

  constructor(
    private $apiSer: ApiService,
    private toastr: ToastrService,
    private http: HttpClient,
    private fb: FormBuilder,
    private Productlist: ProductlistService,
    private router: Router,
    config: NgbModalConfig,
    private modalService: NgbModal,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    this.orderSearchForm = this.fb.group({
      order_number: ['', {
        validators: [
          ValidationService.orderSearchForOrderNumber
        ]
      }],
      from_date: ['', {
        validators: [
          ValidationService.orderSearchForOrderDateRange
        ]
      }],
      to_date: ['', {
        validators: [
          ValidationService.dataRange
        ]
      }]
    });
  }

  submitSearchOrderForm() {
    this.isOrderSearchSubmit = true;
    this.searchAsAText = ``;
    if (this.orderSearchForm.valid) {
      const orderNumberForText = this.orderSearchForm.get('order_number').value ? this.orderSearchForm.get('order_number').value : '';
      this.searchAsAText = `Order list for ${orderNumberForText}`;

      if (this.orderSearchForm.get('from_date').value !== null) {
        const {
          year: fromYear,
          month: fromMonth,
          day: fromDay
        } = this.orderSearchForm.get('from_date').value;

        const fromDate = (fromDay < 10) ? `0${fromDay}` : fromDay;

        (this.orderSearchForm.get('order_number').value) ? this.searchAsAText += ` ` : this.searchAsAText = this.searchAsAText;

        this.searchAsAText += `date from ${fromYear}-${fromMonth}-${fromDate}`;
        this.orderSearchForm.controls.from_date.setValue(`${fromYear}-${fromMonth}-${fromDate}`);
      }

      if (this.orderSearchForm.get('to_date').value !== null) {
        const {
          year: toYear,
          month: toMonth,
          day: toDay
        } = this.orderSearchForm.get('to_date').value;

        const toDate = (toDay < 10) ? `0${toDay}` : toDay;
        this.searchAsAText += ` to ${toYear}-${toMonth}-${toDate}`;
        this.orderSearchForm.controls.to_date.setValue(`${toYear}-${toMonth}-${toDate}`);
      }

      this.searchParamAsString = Object.keys(this.orderSearchForm.value).map(el => {
        if (this.orderSearchForm.value[el] !== null) {
          return `${el}=${this.orderSearchForm.value[el]}`;
        }
      }).filter(fl => {
        return fl !== undefined;
      }).join('&');


      this.orders = [];
      this.isPagination = true;

      if (this.activeTab === 1) {
        this.getOrders(this.searchParamAsString);
      }

      if (this.activeTab === 2) {
        this.getFavouriteOrders(this.searchParamAsString);
      }
    } else {
      this.validateAllFormFields(this.orderSearchForm);
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

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      if (this.isPagination && this.nextPageUrl !== '') {
        if (this.activeTab === 1) {
          this.getOrders();
        }
        if (this.activeTab === 2) {
          this.getFavouriteOrders();
        }
      }
    }
  }

  ngOnInit() {
    this.getOrders();
  }

  addToStockOrder(order) {
    this.$apiSer.post(`${FAVOURITEAPI}`, { 'order_id': order.id }).subscribe(res => {
      if (res.success) {
        order.is_favourite = true;
        this.toastr.success(res.message);
        this.stockOrder = [];
        this.getFavouriteOrders();
      } else {
        this.toastr.warning(res.message);
      }
    }, error => console.log(error), () => { });
  }

  removeToStockOrder(order) {
    this.$apiSer.delete(`${FAVOURITEAPI}/${order.id}`).subscribe(res => {
      if (res.success) {
        order.is_favourite = false;
        this.toastr.success(`${res.message}`);
        this.stockOrder = [];
        this.getFavouriteOrders();
      }
    }, error => console.log(error), () => { });
  }

  removeFromFavourite(stockedOrder) {
    const indexOfStockedOrder = this.stockOrder.indexOf(stockedOrder);
    if (indexOfStockedOrder !== -1) {
      const { order: { id: stockedOrderId } } = stockedOrder;
      this.$apiSer.delete(`${FAVOURITEAPI}/${stockedOrderId}`).subscribe(res => {
        if (res.success) {
          this.toastr.success(res.message);
          this.stockOrder.splice(indexOfStockedOrder, 1);
          this.getOrders();
        } else {
          this.toastr.warning(res.message);
        }
      }, error => console.log(error), () => { });
    } else {
      this.toastr.warning(`This order is not in your stock order.`);
    }
  }

  getOrders(param: string = '') {
    let url = '';

    if (this.nextPageUrl !== '' && this.nextPageUrl !== null) {
      url = this.nextPageUrl.replace(baseUrl, '');
    } else {
      url = `${ORDERSAPI}?page=1`;
    }

    if (param !== '') {
      url = `${ORDERSAPI}?page=1&${param}`;
    }

    if (this.isPagination === true) {
      this.isPagination = false;
      let currentPage = 0;
      let lastPage = 0;
      this.loading = true;

      this.$apiSer.get(`${url}&per_page=20`).subscribe(res => {
        if (res.success) {
          try {
            const {
              data: {
                data,
                current_page,
                last_page,
                next_page_url: nextPageUrl
              }
            } = res;

            currentPage = current_page;
            lastPage = last_page;

            this.nextPageUrl = nextPageUrl;

            this.orders = this.orders.concat(data);
          } catch (error) {
            this.toastr.warning('Something went wrang.');
          }
        }
      }, error => console.log(error), () => {
        if (currentPage !== lastPage) {
          this.isPagination = true;
        } else {
          this.isPagination = false;
        }
        this.orderSearchForm.reset();
        this.loading = false;
      });
    }
  }

  getFavouriteOrders(param: string = '') {
    let url = '';

    if (this.nextPageUrl !== '' && this.nextPageUrl !== null) {
      url = this.nextPageUrl.replace(baseUrl, '');
    } else {
      url = `${FAVOURITEAPI}?page=1`;
    }

    if (param !== '') {
      url = `${FAVOURITEAPI}?page=1&${param}`;
    }

    if (this.isPagination === true) {
      this.isPagination = false;
      let currentPage = 0;
      let lastPage = 0;
      this.loading = true;

      this.$apiSer.get(`${url}&per_page=20`).subscribe(res => {
        if (res.success) {
          try {
            const {
              data: {
                data,
                current_page,
                last_page,
                next_page_url: nextPageUrl
              }
            } = res;

            currentPage = current_page;
            lastPage = last_page;

            this.nextPageUrl = nextPageUrl;

            this.stockOrder = this.stockOrder.concat(data);
          } catch (error) {
            this.toastr.warning(`Something went wrang.`);
          }
        } else {
          this.toastr.warning(`${res.message}`);
        }
      }, error => console.log(error), () => {
        if (currentPage !== lastPage) {
          this.isPagination = true;
        } else {
          this.isPagination = false;
        }
        this.orderSearchForm.reset();
        this.loading = false;
      });
    }
  }

  tabChange(tabId) {
    if (this.activeTab !== tabId) {

      this.nextPageUrl = '';
      this.isPagination = true;
      this.stockOrder = [];
      this.orders = [];

      if (tabId === 1) {
        this.activeTab = tabId;
        this.getOrders(this.searchParamAsString);
      } else {
        this.activeTab = tabId;
        this.getFavouriteOrders(this.searchParamAsString);
      }
    }
  }

  selectOrder(order: string) {
    const indexOforder = this.selectedOrders.indexOf(order);
    if (indexOforder === -1) {
      this.selectedOrders.push(order);
    } else {
      this.selectedOrders.splice(indexOforder, 1);
    }
    this.isCheckedAll = this.selectedOrders.length === this.orders.length;
  }

  selectAll() {
    this.isCheckedAll = !this.isCheckedAll;
    if (this.isCheckedAll) {
      this.orders.forEach(el => {
        this.selectedOrders.push(el);
      });
    } else {
      this.selectedOrders = [];
    }
  }

  bulkDelete = async () => {
    const orderIds = this.selectedOrders.map(order => order.id);
    this.$apiSer.post(`${BULKDELETE}`, { orders: orderIds }).subscribe(res => {
      if (res.success) {
        this.toastr.success('Selected orders are deleted');

        for (let i = 0; this.selectedOrders.length > i; i++) {
          const indexofOrder = this.orders.indexOf(this.selectedOrders[i]);

          if (indexofOrder === -1) {
            return;
          }

          this.orders.splice(indexofOrder, 1);

          if ((this.selectedOrders.length - 1) === i) {
            this.selectedOrders = [];
            this.isCheckedAll = false;
          }

        }

      } else {
        this.toastr.warning('Some of orders are not deleted, which is slecte');
      }
    }, error => {
      this.toastr.warning('Some of orders are not deleted, which is slecte');
    }, () => {
      this.modalService.dismissAll();
    });
  }

  bulkExportOrder = (isItExport: boolean) => {
    const urlParam = this.selectedOrders.map(order => {
      return `orders[]=${order.id}`;
    }).join('&');

    this.$apiSer.get(`${EXPORORDERS}?${urlParam}`).subscribe(res => {
      if (res.success) {

        if (isItExport === true) {
          this.downloadPDF(res.data.download_url, `${new Date().getTime()}.pdf`);
        } else {
          window.open(res.data.download_url);
        }

        this.selectedOrders = [];
        this.isCheckedAll = false;

      }
    }, error => console.log(error), () => { });

  }

  exportOrder = (order: any, isItExport: boolean) => {

    this.$apiSer.get(`${EXPORORDERS}?orders[]=${order.id}`).subscribe(res => {
      if (res.success) {

        if (isItExport === true) {
          this.downloadPDF(res.data.download_url, order.invoice);
        } else {
          window.open(res.data.download_url);
        }

        this.selectedOrders = [];
        this.isCheckedAll = false;

      }
    }, error => console.log(error), () => { });
  }

  downloadPDF(url: string, fileName: string) {
    this.http.get(`${url}`, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
      }
    }).subscribe(
      res => {
        const blob = new Blob([res], { type: 'application/pdf;charset=utf-8' });
        saveAs(blob, fileName);
      },
      error => {
        console.error(`Error: ${error.message}`);
      }
    );
  }

  cancelOrderModal = (order: any) => {
    this.modalService.open(this.orderCancel);
    this.orderToCancel = order;
  }

  openModalToOrderDelete = () => {
    this.modalService.open(this.orderDelete);
    this.orderDelete
  }

  cancelOrder = (order: any) => {
    this.$apiSer.get(`${ORDERAPI}/${order.id}/cancel`).subscribe(res => {
      if (res.success) {
        order.status_label = 'Cancelled';
        this.toastr.success(`Order has been cancled`);
      } else {
        this.toastr.warning(`${res.message}`);
      }
    }, error => console.log(error), () => {
      this.modalService.dismissAll();
    });
  }

  reOrder = (reOrder) => {
    const { order: { items: parts, order_number: orderNumber } } = reOrder;
    this.bulkAddToCart(parts, orderNumber, reOrder);
  }

  private bulkAddToCart = async (parts, orderNumber, order) => {
    const payload = await this.getBulkOrderPayload(parts);

    this.$apiSer.post(`${BULKCARTADDAPI}`, { 'products': payload }).subscribe(res => {
      if (res.success) {
        this.toastr.success(`You have reorder ${orderNumber}.`)

        sessionStorage.setItem('reOrder', JSON.stringify(order));

        setTimeout(() => {
          this.router.navigate(['/cart']);
        }, TOASTRTIMEOUT);

      } else {
        this.toastr.warning(`${res.message}`);
      }
    }, error => console.log(error), () => { });
  }

  private getBulkOrderPayload(parts) {
    const payload = parts.map((el: { product_id, qty }) => {
      const { product_id, qty } = el;
      return {
        product_id,
        qty
      }
    });
    return payload;
  }

  addToCart = (payload) => {
    this.$apiSer.post(`${CARTAPI}/add/product`, payload).subscribe(res => {
      if (res.success) {
        this.toastr.success(`${payload.product_nr} is added in the cart.`);
      } else {
        this.toastr.warning(`${res.message}`);
      }
    }, error => console.log(error), () => { });
  }

  showOrder = (order) => {
    this.selectedOrder = order;
  }
}
