import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalModule as NgxTerminalModule } from 'primeng/terminal';
import { TerminalComponent } from './terminal.component';

@NgModule({
  declarations: [TerminalComponent],
  imports: [
    CommonModule,
    NgxTerminalModule
  ],
  exports: [
    TerminalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TerminalModule { }
