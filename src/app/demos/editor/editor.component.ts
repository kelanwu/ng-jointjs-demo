import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { dia, elementTools, shapes } from 'jointjs';
import { Group } from 'src/app/ui/group';
import { Selection } from '../../ui'

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
  private nodePosition = 100;
  private groupPosition = 200;

  constructor() { }

  ngOnInit(): void {

    this.graph = new dia.Graph();

    this.paper = new dia.Paper({
      el: this.paperRef.nativeElement,
      width: 'calc(w)',
      height: 'calc(h)',
      background: { color: '#eee' },
      gridSize: 1,
      model: this.graph,
      // Embedding
      embeddingMode: true,
      frontParentOnly: false,
      validateEmbedding: function (childView, parentView) {
        const parentType = parentView.model.get('type');
        const childType = childView.model.get('type');
        if (parentType === 'ui.Group' && childType === 'standard.Rectangle') return true;
        return false;
      },
    }).on('blank:pointerdown', (evt, x, y) => {
      this.paper.hideTools();
      selection.startSelecting(evt);
    }).on('cell:pointerdown', (cellView) => {
      this.paper.hideTools();
      if (cellView.hasTools()) {
        cellView.showTools();
      }
    });

    const selection = new Selection({
      paper: this.paper,
      graph: this.graph,
    });
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
    this.paper.hideTools();
  }

  addGroup() {
    const group = new Group();
    this.groupPosition = (this.groupPosition += 10) % 200 + 200;
    group.position(this.groupPosition, this.groupPosition);
    group.resize(200, 200);

    const removeButton = new elementTools.Remove();
    const elementToolsView = new dia.ToolsView({
      tools: [removeButton]
    });

    this.graph.addCell(group);
    group.findView(this.paper).addTools(elementToolsView);
    this.paper.hideTools();
  }
}
