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
    mode: 'custom',
    lint: true
  };

  constructor() { }

  ngOnInit(): void {
    this.editor.writeValue(`Inicio\n\t# code here!\nFin`);
    this.editor.writeValue(`Inicio
    declare a,b1 entero;
    declare x real;
    declare i real;
    declare x1234567890123456 real;
    recibe(x);
    a = 5;
    b = 2;
    si x >= (b + c1) entonces
      # a = a +1
      envia (“HOLA MUNDO”);
    sino
      envia ("ESTO ES UNA PRUEBA");
    finsi;
Fin`)
    applyCustomLanguage(this.editor.codeMirrorGlobal);
  }

}
