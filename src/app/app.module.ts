import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { TopNavComponent } from './header/top-nav/top-nav.component';
import { MainNavComponent } from './header/main-nav/main-nav.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { CartComponent } from './cart/cart.component';
import { CartoverlayComponent } from './cart/cartoverlay/cartoverlay.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CartdeliveryformComponent } from './cart/cartdeliveryform/cartdeliveryform.component';
import { CartpickupformComponent } from './cart/cartpickupform/cartpickupform.component';
import { CartpickupdeliveryformComponent } from './cart/cartpickupdeliveryform/cartpickupdeliveryform.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CompareoverlayComponent } from './catalogue/compareoverlay/compareoverlay.component';
import { CompareproductComponent } from './catalogue/compareproduct/compareproduct.component';
import { ProductdetailsComponent } from './productdetails/productdetails.component';
import { ContactComponent } from './contact/contact.component';
import { ControlMessagesComponent } from './control-messages.component';
import { LogService } from './services/log.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ProfileComponent } from './profile/profile.component';
import { ZoomComponent } from './zoom.component';

// https://www.npmjs.com/package/ngx-swiper-wrapper
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SWIPERCONFIGINTERFACE } from './constant';

import { ToastrModule } from 'ngx-toastr';
import { SignupComponent } from './signup/signup.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderComponent } from './order/order.component';
import { QuickOrderComponent } from './quickorder/quickorder.component';																	 
import { ReferenceNumberComponent } from './cart/reference-number/reference-number.component';
import { MarketIntelComponent } from './market-intel/market-intel.component';
import { AssociatedPartsComponent } from './associated-parts/associated-parts.component';
import { VehiclesComponent } from './productdetails/vehicles/vehicles.component';

// https://www.npmjs.com/package/angular-ng-autocomplete
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    TopNavComponent,
    MainNavComponent,
    CatalogueComponent,
    CartComponent,
    CartoverlayComponent,
    CartdeliveryformComponent,
    CartpickupformComponent,
    CartpickupdeliveryformComponent,
    CompareoverlayComponent,
    CompareproductComponent,
    ProductdetailsComponent,
    ContactComponent,
    ControlMessagesComponent,
    PrivacyPolicyComponent,
    ProfileComponent,
    SignupComponent,
    ChangePasswordComponent,
	QuickOrderComponent,				
    OrderComponent,
    ReferenceNumberComponent,
    MarketIntelComponent,
    AssociatedPartsComponent,
    VehiclesComponent,
    ZoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SwiperModule,
    ToastrModule.forRoot({
      closeButton: true,
      progressBar: true
    }),
    NgbModule,
    AutocompleteLibModule
  ],
  providers: [
    LogService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: SWIPER_CONFIG,
      useValue: SWIPERCONFIGINTERFACE
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
