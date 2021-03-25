import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  visibleInfo = false;

  constructor() { }

  ngOnInit(): void {
  }

  showSideBar() {
    this.visibleInfo = true;
  }

}
