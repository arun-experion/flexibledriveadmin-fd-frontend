import { Component, OnInit} from '@angular/core';
import { StorageClearService } from './storage-clear.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'FlexibleDrive';
  constructor(private storageClearService: StorageClearService) {}

  ngOnInit() {
    // Clear local storage keys with the "rego_" prefix every 2 hours
    setInterval(() => {
      this.storageClearService.clearLocalStorageWithPrefix('rego');
      this.storageClearService.clearLocalStorageWithPrefix('vin');
      this.storageClearService.clearLocalStorageWithPrefix('prod');
    }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  }
}
