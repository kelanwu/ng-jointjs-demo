import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { dia, shapes } from 'jointjs';

const uml = shapes.uml;

@Component({
  selector: 'app-uml-class-diagram',
  templateUrl: './uml-class-diagram.component.html',
  styleUrls: ['./uml-class-diagram.component.scss']
})
export class UmlClassDiagramComponent implements OnInit {

  @ViewChild('paper', { static: true }) paperRef!: ElementRef;

  constructor() { }

  ngOnInit(): void {
    // Graph & Paper

    const graph = new dia.Graph();

    const paper = new dia.Paper({
      el: this.paperRef.nativeElement,
      width: '100%',
      height: '100%',
      background: { color: '#eee' },
      gridSize: 1,
      model: graph
    });

    // Default attrs to style every UML Class shape

    const defaultClassAttrs = {
      '.uml-class-name-rect': {
        fill: '#fff',
        stroke: '#000',
        'stroke-width': 1
      },
      '.uml-class-name-text': {
        'font-size': '14px',
      },
      '.uml-class-attrs-rect': {
        fill: '#fff',
        stroke: '#000',
        'stroke-width': 1
      },
      '.uml-class-attrs-text': {
        'font-size': '14px',
      },
      '.uml-class-methods-rect': {
        fill: '#fff',
        stroke: '#000',
        'stroke-width': 1
      },
      '.uml-class-methods-text': {
        'font-size': '14px',
      },
    };

    // Define UML Classes

    const classes = {
      cell: new uml.Class({
        position: { x: paper.getComputedSize().width / 2 - 100, y: 20 },
        size: { width: 200, height: 150 },
        name: ['dia.Cell'],
        attributes: ['+ id: string | number', '+ graph: Graph', '+ markup: string | MarkupJSON'],
        methods: [
          '+ toJSON()',
          '+ isLink(): boolean',
          '+ isElement(): boolean',
          '...'
        ],
        attrs: defaultClassAttrs,
      }),
      element: new uml.Class({
        position: { x: paper.getComputedSize().width / 2 - 400, y: 300 },
        size: { width: 250, height: 110 },
        name: ['dia.Element'],
        attributes: [],
        methods: [
          '+ position(): g.Point',
          '+ resize(width: number, height: number)',
          '+ addPort(port: Element.Port)',
          '...'
        ],
        attrs: defaultClassAttrs,
      }),
      link: new uml.Class({
        position: { x: paper.getComputedSize().width / 2 + 150, y: 300 },
        size: { width: 280, height: 160 },
        name: ['dia.Link'],
        attributes: [
          '+ toolMarkup: string',
          '+ vertexMarkup: string',
          '+ arrowHeadMarkup: string',
          '...'
        ],
        methods: [
          '+ source(source: Cell)',
          '+ target(target: Cell)',
          '+ appendLabel(label: Link.Label): Link.Label[]',
          '...'
        ],
        attrs: defaultClassAttrs,
      }),
    };

    Object.values(classes).forEach(val => graph.addCell(val));

    // Define relationships between classes

    const relations = [
      new uml.Generalization({ source: { id: classes.element.id }, target: { id: classes.cell.id } }),
      new uml.Generalization({ source: { id: classes.link.id }, target: { id: classes.cell.id } }),
    ];

    Object.values(relations).forEach(val => graph.addCell(val));
  }

}
