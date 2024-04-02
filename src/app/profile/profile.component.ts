import {
  Component,
  OnInit
} from '@angular/core';
import { ApiService } from '../services/api.service';
import {
  LOGOUTAPI,
  PROFILEFORMREADONLY,
  USERPROFILE
} from '../constant';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { ValidationService } from '../services/validation.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  objectKeys = Object.keys;
  private logoutAPI = LOGOUTAPI; // Define string const in the applicaiuton constant.ts
  private userProfileURL = USERPROFILE; // Define string const in the applicaiuton constant.ts
  profileImage: string;
  stateList = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
  loading = false;
  isProfileFormSubmited = false;
  message: any;
  isProfileUpdateFailer = false;

  profileForm: FormGroup;
  isReadOnly = PROFILEFORMREADONLY; // Define boolen const in the applicaiuton constant.ts
  currentUser: any;

  constructor(
    private $apiSer: ApiService,
    private authServ: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {

    this.authServ.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    /**
     * Form control creation and validation
     */
    this.profileForm = this.fb.group({
      first_name: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2)
        ]
      }],
      last_name: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2)
        ]
      }],
      company_name: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2)
        ]
      }],
      address_line1: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2)
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
          Validators.minLength(3),
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
      profile_image: ['']
    });
  }

  ngOnInit() {
    this.getUserProfile(); // After constructor initialization
  }

  getUserProfile() {
    this.$apiSer.get(`${this.userProfileURL}`).subscribe(res => {
      if (res.success) { // Validation for success should true only.
        console.log(res.data);
        /** following const help us to avoid Object copy by reference issue */
        const {
          profile_image: profileImage,
          image_url
        } = res.data;
        this.profileImage = image_url || profileImage || 'assets/images/user-avatar.jpg';
        res.data.profile_image = '';

        /** following is the assignment of value from API response to form inouts */
        this.profileForm.patchValue(res.data);
        localStorage.setItem("state",res.data.state+"01")
      } else {
        this.authServ.logout();
        this.router.navigate(['/']);
      }
    }, error => {
      console.log(error);
    }, () => { });
  }

  handlerFileChange(e) {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    const pattern = /image-*/;
    const reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  private _handleReaderLoaded(e) {
    const reader = e.target;
    this.profileForm.controls.profile_image.setValue(reader.result);
    this.profileImage = reader.result;
  }

  onProfileSubmit() {
    this.isProfileFormSubmited = true;
    if (this.profileForm.valid) {
      this.loading = true;
      this.$apiSer.post(`${this.userProfileURL}`, this.profileForm.value).subscribe(res => {
        if (res.success) {
          // console.log(res)
          const {
            first_name,
            last_name,
            company_name,
            address_line1,
            address_line2,
            state,
            zip,
            mobile,
            image_url,
			email
          } = res.data;

          this.currentUser.first_name = first_name;
          this.currentUser.last_name = last_name;
          this.currentUser.company_name = company_name;
          this.currentUser.address_line1 = address_line1;
          this.currentUser.address_line2 = address_line2;
          this.currentUser.state = state;
          this.currentUser.zip = zip;
          this.currentUser.mobile = mobile;
          this.currentUser.image_url = image_url;
          this.currentUser.email = email;

          this.authServ.login(this.currentUser);
          // this.currentUser.image_url = this.profileForm.controls.profile_image.value

          this.toastr.success(res.message);
          location.reload();
        } else {
          this.toastr.error('Errro while updating profile');
          this.isProfileUpdateFailer = true;
          this.message = res.data;

        }
      }, error => console.log(error), () => {
        this.loading = false;
      });
    } else {
      this.validateAllFormFields(this.profileForm);
    }
  }

  userLogout() {
    this.$apiSer.get(`${this.logoutAPI}`).subscribe(
      res => {
        this.authServ.logout();
        this.router.navigate(['/']);
      }, error => {
        // TODO: If logout error
        console.log(error);
      }, () => { });
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
