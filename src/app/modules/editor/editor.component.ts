import { Component, OnInit, ViewChild } from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { apply as applyCustomLanguage } from './mode/custom/custom-automata.js';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  @ViewChild('editor', { static: true }) editor!: CodemirrorComponent;
  options = {
    lineNumbers: true,
    theme: 'material',
    mode: 'custom'
  };

  constructor() { }

  ngOnInit(): void {
    this.editor.writeValue(`Inicio\n\t# code here!\nFin`);
    applyCustomLanguage(this.editor.codeMirrorGlobal);
  }

}
