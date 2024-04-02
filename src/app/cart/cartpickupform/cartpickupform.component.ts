import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cartpickupform',
  templateUrl: './cartpickupform.component.html',
  styleUrls: ['./cartpickupform.component.css']
})
export class CartpickupformComponent implements OnInit {
  
  @Input() closable = true;
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

}
