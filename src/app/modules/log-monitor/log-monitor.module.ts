import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogMonitorModule as NgxLogMonitorModule } from 'ngx-log-monitor';
import { LogMonitorComponent } from './log-monitor.component';

@NgModule({
  declarations: [
    LogMonitorComponent
  ],
  imports: [
    CommonModule,
    NgxLogMonitorModule
  ],
  exports: [
    LogMonitorComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LogMonitorModule { }
