import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import { ValidationService } from '../services/validation.service';
import {
  CONTACTAPI
} from '../constant';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isContactFormSubmit = false;

  private contactAPI = CONTACTAPI;

  constructor(
    private fb: FormBuilder,
    private $apiSer: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      first_name: ['', {
        validators: Validators.required
      }],
      last_name: ['', {
        validators: Validators.required
      }],
      company: ['', {
        validators: Validators.required
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
      message: ['', {
        validators: [
          Validators.required,
          Validators.minLength(5)
        ]
      }]
    });
  }

  onSubmitContactForm() {
    this.isContactFormSubmit = true;
    if (this.contactForm.valid) {
      this.$apiSer.post(`${this.contactAPI}`, this.contactForm.value).subscribe(res => {
        if (res.success) {
          this.isContactFormSubmit = false;
          this.toastr.success(`Thanks, for contact us. Contact you soon.`);
          this.contactForm.controls.message.setValue('');
          this.contactForm.reset();
        } else {
          this.toastr.warning(`${res.message}`);
        }
      }, error => console.log(error), () => { });
    } else {
      this.validateAllFormFields(this.contactForm);
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
