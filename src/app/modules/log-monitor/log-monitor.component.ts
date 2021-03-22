import { Component, OnInit } from '@angular/core';
import {LogMessage as NgxLogMessage} from 'ngx-log-monitor';
import { timer } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Component({
  selector: 'app-log-monitor',
  templateUrl: './log-monitor.component.html',
  styleUrls: ['./log-monitor.component.scss']
})
export class LogMonitorComponent implements OnInit {
  restoredLogs: NgxLogMessage[] = [
    {message: '¡compilación exitosa!', type: 'SUCCESS'},
  ];
 
  logs: NgxLogMessage[] = [
    {message: 'A simple log message'},
    {message: 'A success message', type: 'SUCCESS'},
    {message: 'A warning message', type: 'WARN'},
    {message: 'An error message', type: 'ERR'},
    {message: 'An info message', type: 'INFO'},
  ];
 
  logStream$ = timer(0, 1000).pipe(
    take(this.logs.length),
    map(i => this.logs[i])
  );

  constructor() { }

  ngOnInit(): void {
    
  }

}
