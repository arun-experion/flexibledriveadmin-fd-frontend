import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from './services/validation.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'control-messages',
  template: `<div *ngIf="errorMessage !== null" class="invalid-feedback">{{errorMessage}}</div>`,
  styles: ['.invalid-feedback { display: block; }']
})
export class ControlMessagesComponent {
  @Input() control: FormControl;
  constructor() { }

  get errorMessage() {
    for (const propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }

    return null;
  }
}