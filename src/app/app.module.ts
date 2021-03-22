import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarModule } from './modules/toolbar/toolbar.module';
import { EditorModule } from './modules/editor/editor.module';
import { SharedLibsModule } from './shared/shared-libs.module';
import { LogMonitorModule } from './modules/log-monitor/log-monitor.module';
import { TerminalModule } from './modules/terminal/terminal.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedLibsModule,
    ToolbarModule,
    EditorModule,
    LogMonitorModule,
    TerminalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
