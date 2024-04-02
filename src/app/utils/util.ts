import { __core_private_testing_placeholder__ } from '@angular/core/testing';

export class Util {
  /**
   * Object to URL query sting
   * @param obj Search param
   * param should not be 0 or ''
   * @return string
   */
  static objectToQueryString(obj: any): string {
    let queryString = '';
    for (const key in obj) {
      if (obj[key] === 0 || obj[key] === '' || obj[key] === '0') {
        continue;
      }

      if (!queryString) {
        queryString = `${key}=${obj[key]}`;
      } else {
        queryString += `&${key}=${obj[key]}`;
      }
    }
    return queryString;
  }
}
