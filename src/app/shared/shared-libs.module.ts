import { NgModule } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { AngularSplitModule } from 'angular-split';
import { SidebarModule } from 'primeng/sidebar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  exports: [
    TabViewModule,
    AngularSplitModule,
    SidebarModule,
    BrowserModule,
    BrowserAnimationsModule
  ]
})
export class SharedLibsModule { }
