import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LocalStorageService } from '../local-storage.service';

import {
  MAKESAPI,
  MODELSAPI,
  PRODUCTSAPI,
  COUNTAPI,
  SEARCHAPI,
  DROPDOWNSAPI,
  MARKETINTEL,
  BANNERAPI,
  SWIPERCONFIGINTERBANNER
} from '../constant';
import { Util } from '../utils/util';
import { pairwise, map, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('searchProductNotFound', { static: false }) searchProductNotFound;
  @ViewChild('VINSearchProductNotFound', { static: false }) VINSearchProductNotFound;

  quickSearchForm: FormGroup;
  advanceSearchForm: FormGroup;
  registrationOrVINSearchForm: FormGroup;
  bannerConfig = SWIPERCONFIGINTERBANNER;

  stateList = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

  isPromotionsVisble: false;
  makeAPI = MAKESAPI;
  modelsAPI = MODELSAPI;
  productsAPI = PRODUCTSAPI;
  countAPI = COUNTAPI;
  searchAPI = SEARCHAPI;
  inputsAPI = DROPDOWNSAPI;

  makeList: any;
  modelList = [];
  productCount: number;
  vinProductCount: number;
  yearList = [];
  chassisCodeList = [];
  bodyTypeList = [];
  engineCodeList = [];
  subModelsList = [];
  vehicles = [];
  vehiclesLoaded = false;
  marketIntel = [];
  banners: any;
  keyword = 'name';
  autofilData = [];
  searchCriteria: any;
  regoVINKey : any;
  searchResponse : any;
  regoVINSearch : any;

  private makeAPIRequest: Subscription;
  private inputsAPIRequest: Subscription;
  private countAPIRequest: Subscription;

  private valid(group) {
    if ((group.controls.state.value !== '' &&
      group.controls.rego_number.value !== '') ||
      group.controls.vin_number.value !== '') {
      return;
    } else {
      return { required: true };
    }
  }

  constructor(
    config: NgbModalConfig,
    private fb: FormBuilder,
    private router: Router,
    private $apiSer: ApiService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private localStorageService: LocalStorageService,
  ) {

    config.backdrop = 'static';
    config.keyboard = false;

    this.registrationOrVINSearchForm = this.fb.group({
      state: [''],
      rego_number: [''],
      vin_number: ['']
    }, { validator: this.valid.bind(this) });

    this.isPromotionsVisble = false;

    this.quickSearchForm = this.fb.group({
      product_nr: ['', Validators.required]
    });

    this.advanceSearchForm = this.fb.group({
      make_id: ['', Validators.required],
      model_id: [0],
      year: [0],
      sub_model: [0],
      chassis_code: [0],
      engine_code: [0],
      cc: [''],
      power: [''],
      body_type: [0]
    });

    this.resetVehicleMakeDependantInputs();
  }

  selectEvent(item) {
    // do something with selected item
      this.advanceSearchForm.get('make_id').setValue(item.id);
  }

  onInputCleared(e) {
    this.advanceSearchForm.get('make_id').setValue("");
  }

  onFocused(e){
    // do something when input is focused
  }

  removeVehicleRow(){
    this.vehicles =[];
    this.vehiclesLoaded = false;
    this.registrationOrVINSearchForm.patchValue({rego_number: ""})
    this.registrationOrVINSearchForm.patchValue({state: ""})
    this.vinProductCount = null
  }

  onAdvanceSearchSubmit() {
    const queryParam = Util.objectToQueryString(this.advanceSearchForm.value);
    const coutURL = `${this.productsAPI}${this.countAPI}?${queryParam}`;

    this.$apiSer.get(`${coutURL}`).subscribe(res => {
      try {
        const { success, message, data: { count } } = res;
        if (success) {
          if (count !== 0) {
            this.router.navigate(['/catalogue'], { queryParams: this.advanceSearchForm.value });
          } else {
            this.modalService.open(this.searchProductNotFound);
          }
        } else {
          this.toastr.warning(message);
        }
      } catch (error) {
        // console.error(error);
        this.toastr.warning(`Something went wrong.`);
      }
    }, error => console.log(error), () => { });
    //
  }

  onQuickSearchFormSubmit() {
    const queryParam = Util.objectToQueryString(this.quickSearchForm.value);
    const coutURL = `${this.productsAPI}${this.countAPI}?${queryParam}`;

    this.$apiSer.get(`${coutURL}`).subscribe(res => {
      try {
        const { success, message, data: { count } } = res;
        if (success) {
          if (count !== 0) {
            this.router.navigate(['/catalogue'], { queryParams: this.quickSearchForm.value });
          } else {
            this.modalService.dismissAll();
            this.modalService.open(this.searchProductNotFound);
          }
        } else {
          this.toastr.warning(message);
        }
      } catch (error) {
        console.error(error);
        this.toastr.warning(`Something went wrong.`);
      }
    }, error => console.log(error), () => { });
  }

  onVinSearchFormSubmit() {
    const queryParam = Util.objectToQueryString(this.registrationOrVINSearchForm.value);

    if(this.registrationOrVINSearchForm.value.rego_number !== '' && this.registrationOrVINSearchForm.value.state !== '' && this.registrationOrVINSearchForm.value.vin_number !== ''){
      this.regoVINSearch = 'rego_state_vin';
      this.regoVINKey = 'rego_vin_' + this.registrationOrVINSearchForm.value.rego_number +'_'+ this.registrationOrVINSearchForm.value.state +'_'+ this.registrationOrVINSearchForm.value.vin_number;
    } else if(this.registrationOrVINSearchForm.value.rego_number !== '' && this.registrationOrVINSearchForm.value.state !== '' && this.registrationOrVINSearchForm.value.vin_number === ''){
      this.regoVINSearch = 'rego_state';
      this.regoVINKey = 'rego_vin_' + this.registrationOrVINSearchForm.value.rego_number +'_'+ this.registrationOrVINSearchForm.value.state;
    } else if(this.registrationOrVINSearchForm.value.rego_number === '' && this.registrationOrVINSearchForm.value.state === '' && this.registrationOrVINSearchForm.value.vin_number !== ''){
      this.regoVINSearch = 'vin';
      this.regoVINKey = 'rego_vin_' + this.registrationOrVINSearchForm.value.vin_number;
    } else{
      this.regoVINSearch = '';
      this.regoVINKey = '';
    }
    if(this.regoVINKey !== ''){
      this.localStorageService.setItem('regoVINKey', this.regoVINKey);  
    }      
    const data = this.localStorageService.getItem(this.regoVINKey);
    const result =  data ? JSON.parse(data) : null;
    if(result !== null && this.regoVINKey !== '') {
      if(result.data.data.data) {
        if (result.data.data.data.length !== 0) {
          this.router.navigate(['/catalogue'], { queryParams: this.registrationOrVINSearchForm.value });
        } else {
          this.modalService.dismissAll();
          this.modalService.open(this.VINSearchProductNotFound);
        }
      }
      else {
        this.toastr.warning(result.message);
      }

    } else{

    
      // return false;
      if (this.registrationOrVINSearchForm.valid) {
      // VINSearchProductNotFound
        const queryParam = Util.objectToQueryString(this.registrationOrVINSearchForm.value);
        const coutURL = `${this.productsAPI}?${queryParam}`;

        this.$apiSer.get(`${coutURL}`).subscribe(res => {
          try {
            const { success, message, data: { count } } = res;

            this.searchResponse = {
              'data' : res,
              'message' : message,
            } 
            if(this.regoVINKey !== ''){
              this.localStorageService.setItem(this.regoVINKey, JSON.stringify(this.searchResponse));
            }
            if (success) {
              if (res.data.total !== 0) {
                this.router.navigate(['/catalogue'], { queryParams: this.registrationOrVINSearchForm.value });
              } else {
                this.modalService.dismissAll();
                this.modalService.open(this.VINSearchProductNotFound);
              }
            } else {
              this.toastr.warning(message);
            }
          } catch (error) {
            this.toastr.warning(`Something went wrong.`);
          }
        }, error => console.log(error), () => { });
      }
    }
  }

  getMarketIntel() {
    this.$apiSer.get(`${MARKETINTEL}`).subscribe(res => {
      try {
        const { success, message, data: { data: marketIntel } } = res;
        if (success) {
          this.marketIntel = marketIntel;
        } else {
          this.toastr.warning(message);
        }
      } catch (error) {
        // console.error(error);
        this.toastr.warning(`Something went wrong.`);
      }
    }, error => console.log(error), () => { });
  }

  getBanner() {
    this.$apiSer.get(`${BANNERAPI}`).subscribe(res => {
      try {
        const { success, message, data: { data: banners } } = res;
        if (success) {
          this.banners = banners;
        } else {
          this.toastr.warning(message);
        }
      } catch (error) {
        // console.error(error);
        this.toastr.warning(`Something went wrong.`);
      }
    }, error => console.log(error), () => { });
  }
  
  getProductCountByVin() {
	if (this.registrationOrVINSearchForm.value.vin_number != ""){
      this.vinSearchProductCount({
        'vin_number': this.registrationOrVINSearchForm.value.vin_number
      });
    }
  };
  
  getProductCountByResigNState() {
    this.searchCriteria = "regoVIN";
    // check local storage for items
    console.log("vehicle registration, state");

    const vinSearchProductCount = {
      'rego_number': this.registrationOrVINSearchForm.value.rego_number,
      'state': this.registrationOrVINSearchForm.value.state,
    }

    this.regoVINKey = 'rego_vin_' + vinSearchProductCount.rego_number +'_'+ vinSearchProductCount.state;

    const data = this.localStorageService.getItem(this.regoVINKey);
    const result =  data ? JSON.parse(data) : null;
    if(result !== null && result.data.data.data.length) {
      this.vinProductCount = result.data.data.data.length;
      if (result.data.data.data.length === 0 && ( this.registrationOrVINSearchForm.value.vin_number != null || this.registrationOrVINSearchForm.value.rego_number != null || this.registrationOrVINSearchForm.value.state != null ) ) {
        this.modalService.dismissAll();
        this.modalService.open(this.VINSearchProductNotFound);
      }else{
        if(result.data.data) {
          if(result.data.data.data) {
            if(result.data.data.data[0].dashboard_vehicles){
              this.vehicles = result.data.data.data[0].dashboard_vehicles;
              this.vehiclesLoaded = true;
            } else{
              this.vehicles = [];
              this.vehiclesLoaded = false;
            }
          }                
        }         
      }      
    }else {
      if (this.registrationOrVINSearchForm.value.rego_number !== '' && this.registrationOrVINSearchForm.value.state !== '') {
          this.vinSearchProductCount({
            'rego_number': this.registrationOrVINSearchForm.value.rego_number,
            'state': this.registrationOrVINSearchForm.value.state
          });
      }
    }
    // console.log('Loaded Data:', result);
    // return false;
  };

  ngOnInit() {
    this.getBanner();
    this.getMarketIntel();

    this.$apiSer.get(`${this.makeAPI}`)
      .subscribe(res => {
        if (res.success) {
          this.makeList = res.data;
          this.autofilData = res.data.all
          // local storage
          const vinSearchProductRespons = {
            'data': res.data,
            'data_all': res.data.all,
          }
        }
      }, error => { }, () => { });

    this.advanceSearchProductCount();
    this.vinSearchProductCount();

    this.advanceSearchForm.controls.make_id.valueChanges
      .subscribe(val => {
        this.resetVehicleMakeDependantInputs();
        if (val !== 0 && val !== '') {
          this.advanceSearchProductCount(this.advanceSearchForm.value);
          this.getModels(val);
        }
      });

    this.advanceSearchForm.valueChanges.pipe(
      pairwise(),
      map(([oldState, newState]) => {
        let changes = {};
        for (const key in newState) {
          if (oldState[key] !== newState[key] &&
            newState[key] !== 0) {
            changes[key] = newState[key];
          }
        }
        return changes;
      }),
      filter(changes => Object.keys(changes).length !== 0)
    ).subscribe(
      changedObj => {
        if (!('make_id' in changedObj) && !('cc' in changedObj) && !('power' in changedObj)) {
          this.getInputs();
          this.advanceSearchProductCount(this.advanceSearchForm.value);
        }
      }
    );

  }

  private resetVehicleMakeDependantInputs() {
    this.advanceSearchForm.controls.model_id.reset(0);
    this.advanceSearchForm.controls.model_id.disable();
    this.resetVehicleModalDepedantInputs();
  }

  private makeChangeEnableInputs() {
    this.advanceSearchForm.controls.model_id.enable();
  }

  private resetVehicleModalDepedantInputs() {
    this.advanceSearchForm.controls.year.reset(0);
    this.advanceSearchForm.controls.year.disable();
    this.advanceSearchForm.controls.sub_model.reset(0);
    this.advanceSearchForm.controls.sub_model.disable();
    this.advanceSearchForm.controls.chassis_code.reset(0);
    this.advanceSearchForm.controls.chassis_code.disable();
    this.advanceSearchForm.controls.engine_code.reset(0);
    this.advanceSearchForm.controls.engine_code.disable();
    this.advanceSearchForm.controls.body_type.reset(0);
    this.advanceSearchForm.controls.body_type.disable();
    this.advanceSearchForm.controls.cc.reset('');
    this.advanceSearchForm.controls.power.reset('');
  }

  private modelChangeEnableInputs() {
    this.advanceSearchForm.controls.year.enable();
    this.advanceSearchForm.controls.sub_model.enable();
    this.advanceSearchForm.controls.chassis_code.enable();
    this.advanceSearchForm.controls.engine_code.enable();
    this.advanceSearchForm.controls.body_type.enable();
  }

  private getModels(makeId: string) {
    try {
      this.makeAPIRequest.unsubscribe();
    } catch (error) { }

    this.makeAPIRequest = this.$apiSer.get(`${this.makeAPI}/${makeId}${this.modelsAPI}`)
      .subscribe(res => {
        if (res.success) {
          this.modelList = res.data;
          this.makeChangeEnableInputs();
        }
      }, error => console.log(error), () => { });
  }

  private getInputs() {
    try {
      this.inputsAPIRequest.unsubscribe();
    } catch (error) { }
    const queryParam = Util.objectToQueryString(this.advanceSearchForm.value);
    this.inputsAPIRequest = this.$apiSer.get(`${this.productsAPI}${this.searchAPI}${this.inputsAPI}?${queryParam}`)
      .subscribe(res => {
        if (res.success) {
          this.modelChangeEnableInputs();
          this.yearList = res.data.years.sort((a, b) => (a > b ? -1 : 1));
          this.chassisCodeList = res.data.chassis_code;
          this.bodyTypeList = res.data.body_type;
          this.engineCodeList = res.data.engine_code;
          this.subModelsList = res.data.sub_models;
        }
      }, error => console.log(error), () => {
      });
  }

  productNR() {
    if (this.quickSearchForm.value.product_nr !== '') {
      this.advanceSearchProductCount(this.quickSearchForm.value);
    }
  }

  VINumber() {
    this.vinSearchProductCount({ 'vin_number': this.registrationOrVINSearchForm.value.vin_number });
  }

  private advanceSearchProductCount(FormControls = {}) {
    try {
      this.countAPIRequest.unsubscribe();
    } catch (error) { }

    const queryParam = Util.objectToQueryString(FormControls);
    if(queryParam === '' || queryParam === null){
      const data = this.localStorageService.getItem('productCount');
      const result =  data ? data : null;
      if (result === null ) {
        const coutURL = `${this.productsAPI}${this.countAPI}?${queryParam}`;
        this.countAPIRequest = this.$apiSer.get(coutURL).subscribe(res => {
          if (res.success) {
            this.productCount = res.data.count;
            if(queryParam === ''){
              this.vinProductCount = res.data.count;
              this.localStorageService.setItem('productCount' , res.data.count);
              this.localStorageService.setItem('vinProductCount' , res.data.count);
            }          
            if (res.data.count === 0) {
              this.modalService.dismissAll();
              this.modalService.open(this.searchProductNotFound);

            }
          }
        }, error => console.log(error), () => { });

      }else{
          this.productCount = result;
      }
          
    } else{
      
      const coutURL = `${this.productsAPI}${this.countAPI}?${queryParam}`;
      this.countAPIRequest = this.$apiSer.get(coutURL).subscribe(res => {
        if (res.success) {
          this.productCount = res.data.count;         
          if (res.data.count === 0) {
            this.modalService.dismissAll();
            this.modalService.open(this.searchProductNotFound);

          }
        }
      }, error => console.log(error), () => { });
    }
  }

  private vinSearchProductCount(FormControls = {}) {
    // rego vinsearch step 2

    const vinSearchProductCount = {
      'rego_number': this.registrationOrVINSearchForm.value.rego_number,
      'state': this.registrationOrVINSearchForm.value.state,
    }

    if(this.registrationOrVINSearchForm.value.rego_number !== '' && this.registrationOrVINSearchForm.value.state !== '' && this.registrationOrVINSearchForm.value.vin_number !== ''){
      this.regoVINSearch = 'rego_state_vin';
      this.regoVINKey = 'rego_vin_' + this.registrationOrVINSearchForm.value.rego_number +'_'+ this.registrationOrVINSearchForm.value.state +'_'+ this.registrationOrVINSearchForm.value.vin_number;
    } else if(this.registrationOrVINSearchForm.value.rego_number !== '' && this.registrationOrVINSearchForm.value.state !== '' && this.registrationOrVINSearchForm.value.vin_number === ''){
      this.regoVINSearch = 'rego_state';
      this.regoVINKey = 'rego_vin_' + this.registrationOrVINSearchForm.value.rego_number +'_'+ this.registrationOrVINSearchForm.value.state;
    } else if(this.registrationOrVINSearchForm.value.rego_number === '' && this.registrationOrVINSearchForm.value.state === '' && this.registrationOrVINSearchForm.value.vin_number !== ''){
      this.regoVINSearch = 'vin';
      this.regoVINKey = 'rego_vin_' + this.registrationOrVINSearchForm.value.vin_number;
    } else{
      this.regoVINKey = '';
      this.regoVINSearch = '';
    }

    const data = this.localStorageService.getItem(this.regoVINKey);
    const result =  data ? JSON.parse(data) : null;
    if(result !== null && this.regoVINKey !== '') {
      if (this.registrationOrVINSearchForm.valid) {   
          this.vinProductCount = result.data.data.total;  
          if (this.vinProductCount === 0 && ( this.registrationOrVINSearchForm.value.vin_number != null || this.registrationOrVINSearchForm.value.vin_number.value.rego_number != null || this.registrationOrVINSearchForm.value.state != null ) ) {
            this.modalService.dismissAll();
            this.modalService.open(this.VINSearchProductNotFound);
          }else{
            if(result.vinProductCount) {
              if(result.data.data) {
                if(result.data.data.data) {
                  if(result.data.data.data[0].dashboard_vehicles){
                    this.vehicles = result.data.data.data[0].dashboard_vehicles;
                  }
                }                
              }  
              this.vehiclesLoaded = true;
            }else{
              if(result.data.data) {
                if(result.data.data.data) {
                  if(result.data.data.data[0].dashboard_vehicles){
                    this.vehicles = result.data.data.data[0].dashboard_vehicles;
                  }
                }                
              } 
              this.vehiclesLoaded = true;
            }
          }
        }
    }
    else{
      if (this.registrationOrVINSearchForm.valid) {
        const queryParam = Util.objectToQueryString(FormControls);
        const coutURL = `${this.productsAPI}?${queryParam}`;
        this.$apiSer.get(coutURL).subscribe(res => {
          if (res.success) {
            this.vinProductCount = res.data.total;
            if (res.data.total === 0 && ( this.registrationOrVINSearchForm.value.vin_number != null || this.registrationOrVINSearchForm.value.vin_number.value.rego_number != null || this.registrationOrVINSearchForm.value.state != null ) ) {
              this.modalService.dismissAll();
              this.modalService.open(this.VINSearchProductNotFound);
              this.searchResponse = {
                'vinProductCount' : res.data.total,
                'data' : res,
              } 
              if(queryParam === ''){
                this.localStorageService.setItem('productCount' , res.data.total);
                this.localStorageService.setItem('vinProductCount' , res.data.total);
              }
            }else{
              if(res.data.data) {
                if(res.data.data[0].dashboard_vehicles){
                  this.vehicles = res.data.data[0].dashboard_vehicles;
                }
              }              
              this.vehiclesLoaded = true;
              this.searchResponse = {
                'vinProductCount' : res.data.total,
                'vehicles' : res.data.vehicles,
                'vehiclesLoaded' : true,
                'data' : res,
                'fullData' : res.data,
              } 
              if(queryParam === ''){
                this.localStorageService.setItem('productCount' , res.data.total);
                this.localStorageService.setItem('vinProductCount' , res.data.total);
              }
            }
            if(this.regoVINKey !== ''){
              this.localStorageService.setItem(this.regoVINKey, JSON.stringify(this.searchResponse));
            }
          }
        }, error => console.log(error), () => { });
      }
    }
   
  }

}
