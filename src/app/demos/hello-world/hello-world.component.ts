import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { dia, shapes } from 'jointjs';

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss']
})
export class HelloWorldComponent implements OnInit {

  @ViewChild('myholder', { static: true }) myholder!: ElementRef;

  constructor() { }

  ngOnInit(): void {
    const namespace = shapes;

    const graph = new dia.Graph({}, { cellNamespace: namespace });

    const paper = new dia.Paper({
      el: this.myholder.nativeElement,
      model: graph,
      width: 600,
      height: 100,
      gridSize: 1,
      cellViewNamespace: namespace,
    });

    const rect = new shapes.standard.Rectangle();
    rect.position(100, 30);
    rect.resize(100, 40);
    rect.attr({
      body: {
        fill: 'blue'
      },
      label: {
        text: 'Hello',
        fill: 'white'
      }
    });
    rect.addTo(graph);

    const rect2 = rect.clone();
    rect2.translate(300, 0);
    rect2.attr('label/text', 'World!');
    rect2.addTo(graph);

    const link = new shapes.standard.Link();
    link.source(rect);
    link.target(rect2);
    link.addTo(graph);
  }

}
