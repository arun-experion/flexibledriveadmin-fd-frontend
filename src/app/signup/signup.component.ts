import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ValidationService } from '../services/validation.service';
import {
  SIGNUPAPI,
  TOASTRTIMEOUT,
  LOGINAPI
} from '../constant';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  objectKeys = Object.keys;
  signupForm: FormGroup;
  stateList = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
  loading = false;
  isSignUpFailed = false;
  message: any = {};
  isSignupSubmited = false;

  private signUpAPI = SIGNUPAPI;
  private loginAPI = LOGINAPI;

  constructor(
    private fb: FormBuilder,
    private $apiSer: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private authServ: AuthenticationService
  ) {
    try {
      const { token } = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) { }
  }

  ngOnInit() {
    this.signupForm = this.fb.group({
      first_name: ['', {
        validators: [
          Validators.required,
        ]
      }],
      last_name: ['', {
        validators: [
          Validators.required,
        ]
      }],
      company_name: ['', {
        validators: [
          Validators.required,
        ]
      }],
      address_line1: ['', {
        validators: [
          Validators.required,
        ]
      }],
      address_line2: [''],
      state: ['', {
        validators: [
          Validators.required,
        ]
      }],
      zip: ['', {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.pattern('[0-9]+')
        ]
      }],
      mobile: ['', {
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern('[0-9]+')
        ]
      }],
      email: ['', {
        validators: [
          Validators.required,
          ValidationService.emailValidator
        ]
      }],
      password: ['', {
        validators: [
          Validators.required,
          ValidationService.passwordValidator
        ]
      }],
      confirm_password: ['', {
        validators: [
          Validators.required,
          ValidationService.mustMatch
        ]
      }]
    });
  }

  onSignUpSubmit() {
    this.isSignupSubmited = true;
    if (this.signupForm.valid) {
      this.loading = true;
      this.$apiSer.post(`${this.signUpAPI}`, this.signupForm.value).subscribe(res => {
        if (res.success) {
          this.toastr.success(res.message);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, TOASTRTIMEOUT);
        } else {
          this.message = res.data;
          this.isSignUpFailed = true;
        }
      }, error => console.log(error), () => {
        this.loading = false;
      });
    } else {
      this.validateAllFormFields(this.signupForm);
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

}
