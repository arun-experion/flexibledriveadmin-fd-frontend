import {
  Component,
  ViewChild,
  AfterViewInit,
  Input
} from '@angular/core';

import {
  NgbModalConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  ApiService
} from 'src/app/services/api.service';

import {
  REFERENCENUMBERAPI
} from '../../constant';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reference-number',
  templateUrl: './reference-number.component.html',
  styleUrls: ['./reference-number.component.css'],
  providers: [
    NgbModalConfig,
    NgbModal
  ]
})
export class ReferenceNumberComponent implements AfterViewInit {
  @ViewChild('orderdetailpopup', { static: false }) orderdetailpopup;

  @Input('order') public order: any;

  orderReferenceNumberForm: FormGroup;
  isOrderReferenceFormSubmited = false;
  loading = false;

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private $apiServ: ApiService,
    private toastr: ToastrService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    this.orderReferenceNumberForm = this.fb.group({
      reference_number: ['', {
        validators: [
          Validators.required
        ]
      }]
    });
  }

  ngAfterViewInit() {
    this.modalService.open(this.orderdetailpopup);
  }

  onSubmitOrderReferenceNumber() {
    this.isOrderReferenceFormSubmited = true;

      this.loading = true;
      this.$apiServ.put(
        `${REFERENCENUMBERAPI}/${this.order.id}`,
        this.orderReferenceNumberForm.value
      ).subscribe(res => {

        this.modalService.dismissAll();

        if (res.success) {
          this.toastr.success(`${res.message}`);
          this.router.navigate(['/order']);
        } else {
          this.toastr.warning(`${res.message}`);
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

  backToOrderPage() {
    this.modalService.dismissAll();
    this.router.navigate(['/order']);
  }

  backToHome() {
    this.modalService.dismissAll();
    this.router.navigate(['/']);
  }
}
