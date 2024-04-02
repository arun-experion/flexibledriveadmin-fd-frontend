import {
  Component
} from '@angular/core';

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
  ApiService
} from '../services/api.service';

import {
  LOGINAPI,
  RESETPASSWORDAPI,
  TOASTRTIMEOUT
} from '../constant';

import {
  AuthenticationService
} from '../services/authentication.service';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {
  ToastrService
} from 'ngx-toastr';

import { environment as env } from 'src/environments/environment';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

const { baseUrl } = env;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  objectKeys = Object.keys;
  loginForm: FormGroup; // Login form
  submitted = false; // Flag for disabled login form submit button
  loading = false; // Flag for show and hide login form loader
  private loginAPI: string = LOGINAPI;
  isLoginFailed = false;
  loginErrorMessage: string;
  isLogin = false;
  isForgotPassword = false;
  isResetPassword = false;
  inactiveUserMesage: string;
  forgotPasswordForm: FormGroup;
  resetPasswordAPI = RESETPASSWORDAPI;

  resetPasswordForm: FormGroup;
  isResetPasswordFailed = false;
  messages: any;
  isMessageString = false;
  videoBaseUrl = baseUrl.replace('api', '');

  constructor(
    private fb: FormBuilder,
    private $apiServ: ApiService,
    private authServ: AuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {
    /* try {
      const { token } = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) { } */
	this.inactiveUserMesage = sessionStorage.inactiveUserMesage;
	sessionStorage.removeItem('inactiveUserMesage');
    this.resetPasswordForm = this.fb.group({
      password: ['', {
        validators: [
          Validators.required,
          ValidationService.passwordValidator
        ],
        updateOn: 'submit'
      }],
      confirm_password: ['', {
        validators: [
          Validators.required,
          ValidationService.mustMatch
        ],
        updateOn: 'submit'
      }],
      token: ['', {
        validators: [
          Validators.required
        ],
        updateOn: 'submit'
      }]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', {
        validators: [
          Validators.required,
          ValidationService.emailValidator
        ],
        updateOn: 'submit'
      }]
    });

    this.loginForm = this.fb.group({
      email: ['', {
        validators: [
          Validators.required,
          ValidationService.emailValidator
        ],
        updateOn: 'submit'
      }],
      password: ['', {
        validators: Validators.required,
        updateOn: 'submit'
      }]
    });

    if (this.router.url === '/forgot-password') {
      this.isForgotPassword = true;
      this.authServ.logout();
    }

    if (this.router.url === '/' || this.router.url === '/login') {
      this.isLogin = true;
      try {
        const { token } = JSON.parse(localStorage.getItem('currentUser'));
        this.router.navigate(['/dashboard']);
        // return;
      } catch (error) {}
    }

    if (this.router.url.match(/\/reset\/password\//g)) {
      this.authServ.logout();
      this.loading = true;
      this.isResetPassword = true;
      const token = this.route.snapshot.paramMap.get('tkn');
      this.resetPasswordForm.controls.token.setValue(token);
      this.$apiServ.get(`${this.resetPasswordAPI}/${token}/verify`).subscribe(res => {
        if (!res.success) {
          this.toastr.error(res.message);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, TOASTRTIMEOUT);
        }
      }, error => console.log(error), () => {
        this.loading = false;
      });
    }

  }

  onResetPasswordSubmit() {
    if (this.resetPasswordForm.valid) {
      this.loading = true;
      this.$apiServ.post(`${this.resetPasswordAPI}/update`, this.resetPasswordForm.value).subscribe(res => {
        if (res.success) {
          this.toastr.success(res.message);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, TOASTRTIMEOUT);
        } else {
          this.isResetPasswordFailed = true;
          this.messages = res.message;
          this.isMessageString = (typeof this.messages === 'string');
        }
      }, error => console.log(error), () => {
        this.loading = false;
      });
    } else {
      this.validateAllFormFields(this.resetPasswordForm);
    }
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.submitted = true;
      this.loading = true;

      this.$apiServ.post(this.loginAPI, this.loginForm.value)
        .subscribe(res => {
          if (res && res.success) {
            this.authServ.login(res.data);
            this.router.navigate(['/dashboard']);
          } else {
            this.authServ.logout();
            this.isLoginFailed = true;
            this.loginErrorMessage = res.message;
          }
        }, error => {
          console.log(error);
        }, () => {
          this.submitted = false;
          this.loading = false;
        });
    } else {
      this.validateAllFormFields(this.loginForm);
    }
  }

  onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.$apiServ.post(`${this.resetPasswordAPI}/request`, this.forgotPasswordForm.value).subscribe(res => {
        if (res.success) {
          this.toastr.success(res.message);
        } else {
          this.toastr.error(res.message);
        }
      }, error => console.log(error), () => {
        this.loading = false;
      });
      console.log(this.forgotPasswordForm.value);
    } else {
      this.validateAllFormFields(this.forgotPasswordForm);
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

  openVideoModal(content) {
    this.modalService.open(content, {centered: true }).result.then((result) => {
     }, (reason) => {
       let videoPlayer = <HTMLVideoElement>document.getElementById('main_video');
       videoPlayer.pause()
     });

     this.playIntroVideo()
  }

  playIntroVideo() {
    let videoPlayer = <HTMLVideoElement>document.getElementById('main_video');
    videoPlayer.play();
  }

}
