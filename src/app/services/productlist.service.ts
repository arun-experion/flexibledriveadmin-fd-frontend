import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject, Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import {
  CARTAPI
} from '../constant';

@Injectable({
  providedIn: 'root'
})
export class ProductlistService {

  private baseUrl = environment.baseUrl;
  public ProductList: any = [];
  public compareProductId: any = [];
  public compareProductList: any = [];
  private _cartItemId = [];
  private _cartSubTota: string;
  private _cartGST: string;
  private _cartDelivaryCharges: string;
  private _cartTotal: string;
  private _pickUpLocations = [];

  private cartItemCount = 0;
  private cartAPI = CARTAPI;
  changeCartItem: Subject<number> = new Subject<number>();
  cart: Subject<any> = new Subject<any>();

  constructor(
    private http: HttpClient,
    private $apiSer: ApiService
  ) { }


  getCartItems() {
    this.$apiSer.get(`${this.cartAPI}/items`).subscribe(res => {
      if (res.success) {
        let cartItemsId = [];
        let cartItems = [];
        this.cart.next(res);
        res.data.items.forEach(el => {
          const { product, qty, product_id } = el;
          cartItemsId.push(product_id);
          product.is_compare = 0;
          product.quantity = qty;
          product.addToCart = 1;
          product.isBackOrderModalShown = false;
          cartItems.push(product);
        })
        this.cartItemId = cartItemsId;
        this.updateProductList(cartItems);
        this.cart.next(res);
      } else {

      }
    }, error => {
      this.cart.next(error)
    }, () => { });
  }

  get pickUpLocation() {
    return this._pickUpLocations;
  }

  set pickUpLocation(locations: any) {
    this._pickUpLocations = locations;
  }

  get cartTotal() {
    return this._cartTotal;
  }

  set cartTotal(total: string) {
    this._cartTotal = total;
  }

  get cartDelivaryCharges() {
    return this._cartDelivaryCharges;
  }

  set cartDelivaryCharges(delivaryCharges: string) {
    this._cartDelivaryCharges = delivaryCharges;
  }

  get cartGST() {
    return this._cartGST;
  }

  set cartGST(GST: string) {
    this._cartGST = GST;
  }

  get cartSubTotal() {
    return this._cartSubTota;
  }

  set cartSubTotal(subTotal: string) {
    this._cartSubTota = subTotal;
  }

  get cartItemId() {
    return this._cartItemId;
  }

  set cartItemId(items: any) {
    this._cartItemId = items;
  }

  getDataFromServer() {
    return this.http.get(this.baseUrl + '/brands');
  }

  getProductDetail(ProductId) {
    return this.http.get(this.baseUrl + '/product/' + ProductId + '/detail');
  }
	
  getProductDetailBySKU(SKU) {
    return this.http.get(this.baseUrl + '/product/' + SKU + '/byskudetail');
  }	
	
  updateProductList(objProductList) {
    this.ProductList = objProductList;
  }

  getCart() {
    return this.ProductList;
  }

  setCompareList(compareList: any) {
    sessionStorage.setItem('compareList', compareList);
  }

  getCompareList() {
    return sessionStorage.getItem('compareList');
  }

  getCompareProduct() {
    this.compareProductList;
  }

  chnageCartItemCount(count: number) {
    this.cartItemCount = count;
    this.changeCartItem.next(this.cartItemCount);
  }
}
