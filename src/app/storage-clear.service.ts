// storage-clear.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageClearService {
  clearLocalStorageWithPrefix(prefix: string) {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => {
        localStorage.removeItem(key);
      });
  }
}
