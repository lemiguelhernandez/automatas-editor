import { Component, OnInit } from '@angular/core';
import { TerminalService } from 'primeng/terminal';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  providers: [TerminalService]
})
export class TerminalComponent implements OnInit {

  constructor(private terminalService: TerminalService) {
    this.terminalService.commandHandler.subscribe(command => {
      command = command.trim();
      let response = (command === 'date') ? new Date().toDateString() : 'Unknown command: ' + command;
      this.terminalService.sendResponse(response);
    });
  }

  ngOnInit(): void {
  }

}
