import { Component, OnInit, HostListener, ApplicationRef, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ProductlistService } from 'src/app/services/productlist.service';
import { PRODUCTSAPI, COUNTAPI, SEARCHAPI, CARTAPI } from '../constant';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environments/environment';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { Util } from '../utils/util';
import { Router } from '@angular/router';
import { exit } from 'process';
const { baseUrl } = env;
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { element } from 'protractor';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-order',
  templateUrl: './quickorder.component.html',
  styleUrls: ['./quickorder.component.css']
})

export class QuickOrderComponent implements OnInit {
  includes = Array.prototype.includes;
  @ViewChild('searchProductNotFound', { static: false }) searchProductNotFound;
  isCheckedAll = false;
  selectedOrders: any[] = [];
  orders = [];
  nextPageUrl = '';
  isPagination = true;
  quickOrderForm: FormGroup;

  partNumber = '';
  qty = '';
  product_id = '';

  ProductSKU: number;
  defaultQty: number;

  productDetail: any = {};
  productData: any = [];
  nullProductName: any =[];
  currentUser: any;
  
  isOrderSearchSubmit = false;
  searchAsAText = '';

  productsAPI = PRODUCTSAPI;
  countAPI = COUNTAPI;

  private cartAPI = CARTAPI;

  public productName: any;
  public criteriaNotes: any;
  public fittingPosition: any;
  public price: any;
  public availability: any;
  public isValid;
  public qtyValid;
  public pid;
  public isValidOrder = null;
  public finalProductData = [];
  public productsArray = [];
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
	
  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    public router: Router,
    private $apiSer: ApiService,
    private Productlist: ProductlistService,
    private toastr: ToastrService,
    private http: HttpClient,
    private fb: FormBuilder,
	private authServ: AuthenticationService,
  ) {
    // this.quickOrderForm = this.fb.group({
    //   partNumber: ['', Validators.required],
    //   qty: ['', Validators.required],
    //   product_id: ['']
    // });
	
	this.authServ.currentUser.subscribe(user => {
      this.currentUser = user;
	});
  }

  ngOnInit() {
      this.quickOrderForm = this.fb.group({
      partNumber: [''],
      qty: [''],
      product_id: [''],
      products: this.fb.array([
		this.initItemRows(),
		this.initItemRows(),
		this.initItemRows(),
		this.initItemRows(),
		this.initItemRows()
      ])
    });
  }
  
  get formArr() {
    return this.quickOrderForm.get('products') as FormArray;
  }

  initItemRows() {
    return this.fb.group({
      partNumber: [''],
      qty: [''],
      product_id: [this.productDetail.id]
    });
  }

  addNewRow() {
    this.isValidOrder = null
    this.isValid = null;
    this.formArr.push(this.initItemRows());
  }
  
  removedProduct=[]
  removeProductListItems(i,pids) {
	var v={};
          v[
            'partNumber'
          ]	=pids;
          v[
            'qty'
          ]	=0;
          v[
            'product_id'
          ]	=pids;
		this.removedProduct.push(v);
		this.isValidOrder=i;
		this.formArr.removeAt(i);
		for (let index = 0; index < this.productData.length; index++) {
			const element = this.productData[index].partNumber;
			if(element==pids){        
				this.productData.splice(i,1);
			}      
    }
    for (let index = 0; index < this.nullProductName.length; index++) {
			const element = this.nullProductName[index].partNumber;
			if(element==pids){        
				this.nullProductName.splice(index,1);
			}      
		}
  }	
	
  checkOutProductNo(no, qty, i) {
	  if (no != null && no !== "" && qty > 0 && qty != null && qty != "") {
		this.isValidOrder = 1;   
        this.isValid = i
        this.ProductSKU = no;
			this.getProductDetailBySKUs(qty, i);	
		
      } else {
        this.isValid = null;
      }
  }
  getProductDetailBySKUs(selqty, ind) {
    this.isValidOrder = null;
    this.pid = null;
    this.isValid=null;
    this.qtyValid=selqty;
    
    return this.Productlist.getProductDetailBySKU(this.ProductSKU)
      .subscribe((response: { success: any, data: any }) => {
        // this.isValidOrder=1
          //  Check if there is a change in the part number in any text box
          console.log('this.nullProductName.length : ', this.nullProductName.length)
          var productAlreadyAddedInNullProductName = false;
          if (this.nullProductName.length > 0){
            for (let index = 0; index < this.nullProductName.length; index++) {
              console.log('checking for ', this.nullProductName[index].partNumber);
              if (this.nullProductName[index].partNumber == this.ProductSKU){
                productAlreadyAddedInNullProductName = true;
              }
              let partNumbers = document.getElementsByClassName('part-number');
              let productFound = false;
              for (let partNumberIndex = 0; partNumberIndex < partNumbers.length; partNumberIndex ++){
                  if ((<HTMLInputElement>partNumbers[partNumberIndex]).value == this.nullProductName[index].partNumber){
                    productFound = true;
                    break;
                  }
              }
              console.log('found ? ', this.nullProductName[index].partNumber);
              console.log(productFound);
              if (productFound == false){
                this.nullProductName.splice(index, 1);
                index = index - 1;
              }
              console.log(this.nullProductName);
            }
          }
          //  Check if there is a change in the part number in any text box
          console.log('this.productData.length : ', this.productData.length)
          var productAlreadyAddedInProductData = false;
          if (this.productData.length > 0){
            for (let index = 0; index < this.productData.length; index++) {
              console.log('checking for ', this.productData[index].partNumber);
              if (this.productData[index].partNumber == this.ProductSKU){
                productAlreadyAddedInProductData = true;
              }
              let partNumbers = document.getElementsByClassName('part-number');
              let productFound = false;
              for (let partNumberIndex = 0; partNumberIndex < partNumbers.length; partNumberIndex ++){
                  if ((<HTMLInputElement>partNumbers[partNumberIndex]).value == this.productData[index].partNumber){
                    productFound = true;
                    break;
                  }
              }
              console.log('found ? ', this.productData[index].partNumber);
              console.log(productFound);
              if (productFound == false){
                this.productData.splice(index, 1);
                index = index - 1;
              }
              console.log(this.productData);
            }
          }
        if (response.data) {
          this.isValidOrder = 1;
          this.productDetail = response.data;
          
          var p:string=this.productDetail.id;	
          
          var v={};
          v[
            'partNumber'
          ]	=this.ProductSKU;
          v[
            'qty'
          ]	=selqty;
          v[
            'product_id'
          ]	=this.productDetail.id;
          //if (productAlreadyAddedInProductData == false){
            this.productData.push(v);
          //}
          
          (<HTMLInputElement>document.getElementById('product_id'+ind)).value=p;
		  this.quickOrderForm.controls['product_id'].setValue(this.productDetail.id)//id
          
        } else {
          this.isValidOrder=1;
          this.isValid = null;
          
          var e={};
          e[
            'partNumber'
          ]	=this.ProductSKU;
          e[
            'qty'
          ]	=selqty;
          e[
            'partNumber'
          ]	=this.ProductSKU;
          if (productAlreadyAddedInNullProductName == false){
            this.nullProductName.push(e)
          }
          // if(this.removedProduct.length>0){
          //   for (let index = 0; index < this.removedProduct.length; index++) {
          //     const element = this.removedProduct[index].partNumber;
          //     if(element===this.ProductSKU){ 
          //       this.nullProductName.splice(ind,1);                
          //       return;
          //     }      
          //   }      
          //     console.log(this.nullProductName)
          // }else{
          //   this.nullProductName.push(e)
          // }  
         
         
          //this.toastr.warning('Product Not Found.');
        }
      });
  }
  
  getProductDetailBySKU(selqty, ind) {
    this.isValidOrder = null;
    this.pid = null;
    this.isValid=null;
    this.qtyValid=selqty;
    
    return this.Productlist.getProductDetailBySKU(this.ProductSKU)
      .subscribe((response: { success: any, data: any }) => {
        // this.isValidOrder=1
        if (response.data) {
          this.isValidOrder = 1;
          this.productDetail = response.data;
          var productcode = (this.productDetail.product_nr) ? this.productDetail.product_nr : '';
          var productcode2 = (this.productDetail.corresponding_part_number) ? ' <br>OR<br> ' + this.productDetail.corresponding_part_number : '';
		  
		  var productbrandname = (this.productDetail.brand.name) ? this.productDetail.brand.name : '';
		  var productdesc = (this.productDetail.description) ? this.productDetail.description : '';
		  
          var productdetails =  '<div class="font-weight-bold">'+productbrandname+'</div><div>'+productdesc+'</div>';
			
          var criteriaNotes = '<div>';
          if (this.productDetail.criteria.length > 0) {
			  var crit = this.productDetail.criteria;
			  crit.forEach(function (crit) {
				  criteriaNotes += crit.criteria_name + ': ' + crit.criteria_value + '<br>';
			  });
          }
		  criteriaNotes += '</div>';
		  
		  var netprice = (this.productDetail.price_nett) ? '<div class="font-weight-bold">Nett: $'+this.productDetail.price_nett+'</div>' : '';
		  var retailprice = (this.productDetail.price_retail) ? '<div style="color: #6c757d !important;">Retail: $'+this.productDetail.price_retail+'</div>' : '';
		  
          var price = '<div>'+netprice + retailprice+'</div>';
          var availability = (this.productDetail.qty) ? '<li class="text-success">' + this.productDetail.qty + ' Items </li>' : '0' + ' Items';

          var branchwise = (this.productDetail.qty_with_location) ? this.productDetail.qty_with_location : [];
          var branchwisestock = '';
          var interstate = 0;
		  var currentuserstock = 0;
		  
		  branchwisestock += '<li>';
		  
          branchwise.forEach(branchdata => {
			if (this.state[this.currentUser.state].includes(branchdata.branch.name) && branchdata.qty != 0) {
			  branchwisestock += branchdata.branch.name + ': ' + branchdata.qty + ' ';
			  currentuserstock += branchdata.qty;
			}
          });
		  
		  branchwisestock += '</li>';
		  
		  interstate = this.productDetail.qty - currentuserstock;
		  
		  var finalavailability = '';		
		  if(this.productDetail.qty === 0){
			  finalavailability = branchwisestock + '<li class="text-danger">Back order</li>';
		  }	else {
			  finalavailability = availability + branchwisestock + 'Interstate : '+interstate;
		  }
		
		  var fittingPosition = (this.productDetail.fitting_position) ? this.productDetail.fitting_position : '';
		  
		  //document.getElementById('productCode' + ind).innerHTML = productcode + productcode2;
          document.getElementById('productName' + ind).innerHTML = productdetails;
          document.getElementById('criteriaNotes' + ind).innerHTML = criteriaNotes;
          document.getElementById('fittingPosition' + ind).innerHTML = fittingPosition;
          document.getElementById('price' + ind).innerHTML = price;
          document.getElementById('availability' + ind).innerHTML = '<div class="body-col delivered-body-col"><ul class="list-unstyled">'+finalavailability+'</ul></div>';
          
          var p:string=this.productDetail.id;	
          
          (<HTMLInputElement>document.getElementById('product_id'+ind)).value=p;
		  this.quickOrderForm.controls['product_id'].setValue(this.productDetail.id)//id
          
        } else {
          this.toastr.warning('This part number is not available. Enter a valid part number.');
        }
      });
  }
  
  isShowDetails:boolean=false;

  onCheckProduct(partNumber, qty, ind) {
    if (!partNumber) {
      this.isValid = null;
      this.isValidOrder = null;
      this.toastr.warning('Part number is required!');
    } else if (!qty) {
      this.isValid = null;
      this.isValidOrder = null;
      this.toastr.warning('Qty is required!');
    } else {
      this.isShowDetails=true;
      this.ProductSKU = partNumber;
      this.getProductDetailBySKU(qty, ind);
    }
  }
	
  onProductNo(i){
	  var defaultQty:string='1';	
	 (<HTMLInputElement>document.getElementById('qty'+i)).value=defaultQty;	
  }	
  public message:string=""
  public isSubmited:boolean=false;

  placeOrde(){
    if (this.quickOrderForm.valid) {
      this.finalProductData = [];
      this.productsArray = [];      
		if(this.productData.length > 0)	{
		  // Previous working code
		  for (let index = 0; index < this.productData.length; index++) {
			const element = this.productData[index].partNumber;
			
			if (element != null && element !== "") {
			  this.finalProductData.push(this.productData[index]);
			}
		  }
		  this.productsArray.push({['products'] : this.finalProductData});
		  // Previous working code
		 
		  //this.quickOrderForm.controls["products"].patchValue(this.finalProductData);
		  this.$apiSer.post(`${this.cartAPI}/add/bulk/product`, this.productsArray[0]).subscribe(res => {
			if (res.success==true) {
				this.router.navigateByUrl('/cart', { skipLocationChange: true }).then(() => {
					this.router.navigate(['cart']);
			  });
			  this.modalService.dismissAll();
				this.toastr.success(`${res.message}`);
			} else {
				this.toastr.error(`${res.message}`);
			}
		  }, error => console.log(error), () => { });
		} else {
			
		}
      } else {
		 console.log(this.nullProductName);
      }
  }
  removeArray(){
    ////this.nullProductName=[];
  }
  onQuickOrderFormSubmit() {
    if (this.quickOrderForm.valid) {
		this.finalProductData = [];
		this.productsArray = [];
		this.message="";
		
		if(this.nullProductName.length>0){
		  for (let index = 0; index < this.nullProductName.length; index++) {
			const element = this.nullProductName[index].partNumber;
			this.message+= element+", "
		  }
		  this.message=this.message.slice(0, -1);
		  this.message=this.message.replace(/,\s*$/,"");
		  console.log("Null Product ", this.message.slice(0, -1))
		  this.modalService.open(this.searchProductNotFound);
		}else{
			this.placeOrde();
		}
	 }
  }
}