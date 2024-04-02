import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit {

  @Input() vehicles = [];

  constructor() { }

  ngOnInit() {
    console.log(this.vehicles);
  }
}
