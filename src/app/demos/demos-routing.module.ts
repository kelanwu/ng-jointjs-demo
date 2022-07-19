import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditorComponent } from './editor/editor.component';
import { HelloWorldComponent } from './hello-world/hello-world.component';
import { UmlClassDiagramComponent } from './uml-class-diagram/uml-class-diagram.component';

const routes: Routes = [
  { path: 'hello-world', component: HelloWorldComponent },
  { path: 'uml-class-diagram', component: UmlClassDiagramComponent },
  { path: 'editor', component: EditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemosRoutingModule { }
