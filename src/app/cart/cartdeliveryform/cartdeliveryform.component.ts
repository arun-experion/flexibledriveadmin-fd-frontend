import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cartdeliveryform',
  templateUrl: './cartdeliveryform.component.html',
  styleUrls: ['./cartdeliveryform.component.css']
})
export class CartdeliveryformComponent implements OnInit {

  @Input() closable = true;
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

}
