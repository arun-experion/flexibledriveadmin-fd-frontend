import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ValidationService } from '../services/validation.service';
import { ApiService } from '../services/api.service';
import { USERPASSWORDAPI, LOGOUTAPI } from '../constant';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  isChangePasswordSubmited = false;
  loading = false;
  private userPasswordApi = USERPASSWORDAPI;
  private logoutApi = LOGOUTAPI;
  isChangePasswordFailed = false;
  messages: any = {};
  // private logoutAPI = LOGOUTAPI;

  constructor(
    private fb: FormBuilder,
    private $apiSer: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private authServ: AuthenticationService
  ) {
    this.changePasswordForm = this.fb.group({
      old_password: ['', {
        validators: [
          Validators.required
        ]
      }],
      new_password: ['', {
        validators: [
          Validators.required,
          ValidationService.passwordValidator
        ]
      }],
      confirm_password: ['', {
        validators: [
          Validators.required,
          ValidationService.mustMatchChangePassword
        ]
      }],
      token: ['', {
        validators: [
          Validators.required
        ],
        updateOn: 'submit'
      }]
    });

    const { token } = JSON.parse(localStorage.getItem('currentUser'));
    this.changePasswordForm.controls.token.setValue(token);
  }

  ngOnInit() {
  }

  onChangePasswordSubmit() {
    this.isChangePasswordSubmited = true;
    this.loading = true;

    if (this.changePasswordForm.invalid) {
      this.validateAllFormFields(this.changePasswordForm);
      this.loading = false;
      return;
    }

    this.$apiSer.post(`${this.userPasswordApi}/change`, this.changePasswordForm.value).subscribe(res => {
      if (res.success) {
        this.toastr.success(res.message);
        this.$apiSer.get(`${this.logoutApi}`).subscribe(logoutRes => {
          if (logoutRes.success) {
            this.authServ.logout(); // Removing data from localStorage.
            this.router.navigate(['/']); // Page redirection on logout
          }
        }, error => console.log(error), () => {
        });
      } else {
        this.isChangePasswordFailed = true;
        this.messages = res.message;
        console.log(this.messages)
      }
    }, error => console.log(error), () => {
      this.loading = false;
    });

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

  userLogout() {
    this.$apiSer.get(`${this.logoutApi}`).subscribe(
      res => {
        if (res.success) { // Validation for API success only
          this.authServ.logout(); // Removing data from localStorage.
          this.router.navigate(['/']); // Page redirection on logout
        } else {
          // TODO: If login response not success
        }
      }, error => {
        // TODO: If logout error
        console.log(error);
      }, () => { });
  }
}
