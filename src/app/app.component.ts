import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { dia, shapes } from 'jointjs';

@Component({
  selector: 'ng-jointjs-demo',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('canvas', { static: true }) canvas!: ElementRef;

  private graph!: dia.Graph;
  private paper!: dia.Paper;

  ngOnInit(): void {
    // const graph = this.graph = new dia.Graph({}, { cellNamespace: shapes });

    // this.paper = new dia.Paper({
    //   el: this.canvas.nativeElement,
    //   model: graph,
    //   width: 600,
    //   height: 100,
    //   gridSize: 1,
    //   cellViewNamespace: shapes,
    // });

    // const rect = new shapes.standard.Rectangle();
    // rect.position(100, 30);
    // rect.resize(100, 40);
    // rect.attr({
    //   body: {
    //     fill: 'blue'
    //   },
    //   label: {
    //     text: 'Hello',
    //     fill: 'white'
    //   }
    // });
    // rect.addTo(graph);

    // const rect2 = rect.clone();
    // rect2.translate(300, 0);
    // rect2.attr('label/text', 'World!');
    // rect2.addTo(graph);

    // const link = new shapes.standard.Link();
    // link.source(rect);
    // link.target(rect2);
    // link.addTo(graph);
  }
}
