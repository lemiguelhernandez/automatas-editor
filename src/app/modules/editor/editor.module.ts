import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

@NgModule({
  declarations: [
    EditorComponent
  ],
  imports: [
    CommonModule,
    CodemirrorModule
  ],
  exports: [
    EditorComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditorModule { }
