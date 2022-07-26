import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DemosRoutingModule } from './demos-routing.module';
import { EditorComponent } from './editor/editor.component';
import { HelloWorldComponent } from './hello-world/hello-world.component';
import { UmlClassDiagramComponent } from './uml-class-diagram/uml-class-diagram.component';

@NgModule({
  declarations: [
    HelloWorldComponent,
    UmlClassDiagramComponent,
    EditorComponent,
  ],
  imports: [
    CommonModule,
    DemosRoutingModule,
  ]
})
export class DemosModule { }
