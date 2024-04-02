import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cartpickupdeliveryform',
  templateUrl: './cartpickupdeliveryform.component.html',
  styleUrls: ['./cartpickupdeliveryform.component.css']
})
export class CartpickupdeliveryformComponent implements OnInit {

  @Input() closable = true;
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  constructor() { }

  ngOnInit() {
  }

}
