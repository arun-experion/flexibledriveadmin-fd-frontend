import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SESSIONSTORAGECOMPARELIST, SESSIONSTORAGECOMPARELISTIDS } from '../constant';

@Injectable({
  providedIn: 'root'
})
export class CompareService {
  compareList: any = [];
  compareListIds: any = [];

  subCompareListAndIDs = new Subject<any>();

  constructor(
    private toastr: ToastrService
  ) {
    try {
      const { id } = JSON.parse(sessionStorage.getItem(SESSIONSTORAGECOMPARELIST));
      this.compareList = JSON.parse(sessionStorage.getItem(SESSIONSTORAGECOMPARELIST)) || [];
      this.compareListIds = JSON.parse(sessionStorage.getItem(SESSIONSTORAGECOMPARELISTIDS)) || [];

      this.updateSub(this.compareList, this.compareListIds);
    } catch (error) { }
  }

  getSub() {
    return {
      'compareList': this.compareList,
      'compareListIDs': this.compareListIds
    }
  }

  setCompareListAndIds(compareList, IDs) {
    this.compareList = compareList;
    this.compareListIds = IDs;

    this.subCompareListAndIDs.next({ compareList, IDs });
  }

  addOrRemove(part) {
    const { is_compare: isCompare, id } = part;
    if (isCompare === 0 && this.compareList.length === 3) {
      this.toastr.warning('You can compare only 3 products.');
      return;
    } else {
      if (isCompare === 1) {
        this.remove(part);
      } else {
        part.is_compare = 1;
        this.add(part);
      }
    }
  }

  add(part) {
    const { id, company_sku } = part;

    this.compareList.push(part);
    this.compareListIds.push(id);

    this.next(this.compareList, this.compareListIds);

    this.toastr.success(`${company_sku} is added in the compare list.`);
  }

  remove(part) {
    const { id, company_sku } = part;

    const partIndx = this.compareList.indexOf(part);
    this.compareList.splice(partIndx, 1);

    const idIndx = this.compareListIds.indexOf(id);
    this.compareListIds.splice(idIndx, 1);


    this.next(this.compareList, this.compareListIds);

    this.toastr.warning(`${company_sku} is removed in the compare list.`);
  }

  removeAll() {
    this.compareList = [];
    this.compareListIds = [];
    this.next(this.compareList, this.compareListIds);

  }

  next(compareList, compareListIds) {
    sessionStorage.setItem(SESSIONSTORAGECOMPARELIST, JSON.stringify(this.compareList));
    sessionStorage.setItem(SESSIONSTORAGECOMPARELISTIDS, JSON.stringify(this.compareListIds));

    this.updateSub(compareList, compareListIds);
  }

  updateSub(compareList, compareListIds) {
    this.subCompareListAndIDs.next({
      'compareList': compareList,
      'compareListIDs': compareListIds
    });
  }
}

