import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { dia, elementTools, shapes } from 'jointjs';
import { firstValueFrom, timer } from 'rxjs';
import { Collapse, Group, Selection } from '../../ui'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  @ViewChild('paper', { static: true }) paperRef!: ElementRef;

  private graph!: dia.Graph;
  private paper!: dia.Paper;
  private nodeCount = 0;
  private groupCount = 0;
  private collapseCount = 0;
  private nodePosition = 50;
  private groupPosition = 150;
  private collapsePosition = 300;

  constructor() { }

  ngOnInit(): void {

    this.graph = new dia.Graph();

    this.paper = new dia.Paper({
      el: this.paperRef.nativeElement,
      width: '100%',
      height: '100%',
      background: { color: '#eee' },
      gridSize: 1,
      model: this.graph,
      async: true,
      // Embedding
      embeddingMode: true,
      frontParentOnly: false,
      validateEmbedding: function (childView, parentView) {
        const parentType = parentView.model.get('type');
        const childType = childView.model.get('type');
        if (parentType === 'ui.Group' && childType === 'standard.Rectangle') return true;
        if (parentType === 'ui.Collapse' && childType === 'standard.Rectangle') return true;
        return false;
      },
      // a callback function that is used to determine whether a given view should be shown in an async paper
      viewport: function (view) {
        const model: dia.Cell = view.model;

        if (model.getAncestors().some((ancestor) => ancestor.get('type') === 'ui.Collapse'
          && (ancestor as any).isCollapsed())) {
          return false;
        }

        return true;
      }
    }).on('blank:pointerdown', (evt, x, y) => {
      this.paper.hideTools();
      selection.startSelecting(evt);
    }).on('cell:pointerdown', (cellView) => {
      this.paper.hideTools();
      if (cellView.hasTools()) {
        cellView.showTools();
      }
    }).on('element:button:pointerclick', (view: dia.CellView) => {
      const type = view.model.get('type');
      if (type === 'ui.Collapse') {
        (view.model as any).toggle();
      }
    });

    const selection = new Selection({
      paper: this.paper,
      graph: this.graph,
    });
  }

  logJSON() {
    console.log(this.graph.toJSON());
  }

  addNode() {
    const rect = new shapes.standard.Rectangle();
    this.nodePosition = (this.nodePosition += 10) % 100 + 100;
    rect.position(this.nodePosition, this.nodePosition);
    rect.resize(50, 50);
    rect.attr({
      body: {
        fill: 'white'
      },
      label: {
        text: `Node ${++this.nodeCount}`,
        fill: 'black'
      }
    });

    const removeButton = new elementTools.Remove();
    const elementToolsView = new dia.ToolsView({
      tools: [removeButton]
    });

    this.graph.addCell(rect);
    rect.findView(this.paper).addTools(elementToolsView);
  }

  addGroup() {
    const group = new Group();
    this.groupPosition = (this.groupPosition += 10) % 200 + 200;
    group.position(this.groupPosition, this.groupPosition);
    group.resize(200, 200);
    group.attr('label/text', `Group ${++this.groupCount}`);

    const removeButton = new elementTools.Remove();
    const elementToolsView = new dia.ToolsView({
      tools: [removeButton]
    });

    this.graph.addCell(group);
    group.findView(this.paper).addTools(elementToolsView);
  }

  addCollapse() {
    const collapse = new Collapse();
    this.collapsePosition = (this.collapsePosition += 10) % 300 + 300;
    collapse.position(this.collapsePosition, this.collapsePosition);
    collapse.resize(200, 200);
    collapse.attr({
      headerText: {
        text: `Collapse ${++this.collapseCount}`,
      }
    });

    const removeButton = new elementTools.Remove();
    const elementToolsView = new dia.ToolsView({
      tools: [removeButton]
    });

    this.graph.addCell(collapse);
    collapse.findView(this.paper).addTools(elementToolsView);
    (collapse as any).toggle(false);
  }

  addLazyLoadCollapse() {
    this.collapsePosition = (this.collapsePosition += 10) % 300 + 300;
    const collapse = new Collapse({
      lazyLoad: true,
      position: { x: this.collapsePosition, y: this.collapsePosition },
      size: { width: 200, height: 200 },
      attrs: {
        headerText: {
          text: `Collapse(Lazy) ${++this.collapseCount}`,
        }
      }
    }).on('lazyload', async () => {
      // Emulate async
      await firstValueFrom(timer(2000));

      collapse.attr('loading/visibility', 'hidden');
      const { x, y } = collapse.getBBox();
      const nodeList = [];
      for (let i = 0; i < 100; ++i) {
        const rect = new shapes.standard.Rectangle();
        rect.position(x + (i % 10 * 50), y + (Math.floor(i / 10) * 50));
        rect.resize(40, 40);
        rect.attr({
          body: { fill: 'white' },
          label: {
            text: `EN ${i + 1}`,
            fill: 'black'
          }
        });
        nodeList.push(rect);
      }
      this.graph.addCells(nodeList);
      collapse.embed(nodeList);
      collapse.fitEmbeds({ padding: { left: 10, top: 34, right: 10, bottom: 10 } });
    });

    const removeButton = new elementTools.Remove();
    const elementToolsView = new dia.ToolsView({
      tools: [removeButton]
    });

    this.graph.addCell(collapse);
    collapse.findView(this.paper).addTools(elementToolsView);
    (collapse as any).toggle(true);
  }
}
