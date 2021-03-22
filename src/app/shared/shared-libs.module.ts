import { NgModule } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { AngularSplitModule } from 'angular-split';

@NgModule({
  exports: [
    TabViewModule,
    AngularSplitModule
  ]
})
export class SharedLibsModule { }
