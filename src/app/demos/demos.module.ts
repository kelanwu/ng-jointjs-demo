import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DemosRoutingModule } from './demos-routing.module';
import { HelloWorldComponent } from './hello-world/hello-world.component';

@NgModule({
  declarations: [
    HelloWorldComponent
  ],
  imports: [
    CommonModule,
    DemosRoutingModule,
  ]
})
export class DemosModule { }
