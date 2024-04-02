import { FormGroup } from '@angular/forms';

export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        const config = {
            required: 'Required',
            invalidEmailAddress: 'Invalid email address',
            invalidPassword: 'Invalid password. Your password must be at least 8 characters with 1 capital letter and 1 number.',
            passwordNotMatch: 'Passwords must match',
            orderSearch: 'Order search required order number or date range to search.',
            minlength: `Please enter at least ${validatorValue.requiredLength} characters.`,
            pattern: `Please add valid contact number.`
        };

        return config[validatorName];
    }

    static emailValidator(control) {
        // tslint:disable-next-line: max-line-length
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        } else {
            return { invalidEmailAddress: true };
        }
    }

    static passwordValidator(control) {
        // (?=.{8,100})      - Assert password is between 8 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        // (?=.*[A-Z])       - Assert a string has at least upper case letter
        if (control.value.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.{8,100})/)) {
            return null;
        } else {
            return { invalidPassword: true };
        }
    }

    static mustMatch(control) {
        if (control.parent && control.parent.value) {
            if (control.value === control.parent.controls.password.value) {
                return null;
            } else {
                return { passwordNotMatch: true };
            }
        }
    }

    static orderSearchForOrderNumber(control) {
        if (control.parent &&
            control.parent.value) {
            if (control.value ||
                control.parent.controls.from_date.value) {
                control.parent.controls.from_date.setErrors(null);
                control.parent.controls.to_date.setErrors(null);
                return null;
            } else {
                return { orderSearch: true };
            }
        }
    }

    static orderSearchForOrderDateRange(control) {
        if (control.parent && control.parent.value) {
            if (control.value ||
                control.parent.controls.order_number.value) {
                control.parent.controls.order_number.setErrors(null);
                return null;
            } else {
                return { orderSearch: true };
            }
        }
    }

    static dataRange(control) {
        if (control.parent &&
            control.parent.value) {
            if (control.parent.controls.order_number.value !== null ||
                (control.parent.controls.from_date.value !== null &&
                    control.value !== null)) {
                return null;
            } else {
                return { required: true };
            }
        }
    }

    static mustMatchChangePassword(control) {
        if (control.parent &&
            control.parent.value) {
            if (control.value === control.parent.controls.new_password.value) {
                return null;
            } else {
                return { passwordNotMatch: true };
            }
        }
    }
}
