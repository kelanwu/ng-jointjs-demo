import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { dia, elementTools, shapes } from 'jointjs';
import { concatMap, distinct, filter, firstValueFrom, from, of, timer } from 'rxjs';

import { Collapse, Group } from '../../shapes';
import { Selection } from '../../ui';

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
      linkPinning: false,
      validateConnection: (cellViewS, magnetS, cellViewT, magnetT, end, linkView) => {
        // Prevent Link to Link connections
        if (cellViewS.model.isLink() || cellViewT.model.isLink()) return false;

        // Prevent loop linking
        if (cellViewS === cellViewT || magnetS === magnetT) return false;

        // Limit 1 link between two nodes
        const links = this.graph.getConnectedLinks(cellViewS.model).filter(link => link.id !== linkView.model.id);
        let linkCount = 0;
        for (const link of links) {
          if ((link.getSourceCell()?.id === cellViewS.model.id && link.getTargetCell()?.id === cellViewT.model.id) ||
            (link.getTargetCell()?.id === cellViewS.model.id && link.getSourceCell()?.id === cellViewT.model.id)) {
            ++linkCount;
          }
        }
        if (linkCount > 0) {
          return false;
        }

        // Allow all other connections
        return true;
      },
      // Embedding
      embeddingMode: true,
      frontParentOnly: false,
      validateEmbedding: function (childView, parentView) {
        const parentType = parentView.model.get('type');
        const childType = childView.model.get('type');
        if (parentType === Group.type && childType === 'standard.Rectangle') return true;
        if (parentType === Collapse.type && childType === 'standard.Rectangle') return true;
        return false;
      },
      viewport: function (view) {
        const model: dia.Cell = view.model;

        // Hide elements and links that are descendants of a collapsed collapse
        if (Collapse.isDescendantOfCollapsed(model)) {
          return false;
        }

        if (model.isLink()) {
          const link = model as dia.Link;
          const endCells = [link.getSourceCell(), link.getTargetCell()];
          // Hide links with at least one end cell that is descendant of a collapsed collapse
          if (endCells.some(Collapse.isDescendantOfCollapsed)) {
            return false;
          }
        }

        return true;
      }
    }).on('blank:pointerdown', (evt, x, y) => {
      selection.startSelecting(evt);
    }).on('element:mouseenter', (elementView) => {
      const remove = new elementTools.Remove({
        x: 0,
        y: 0,
      });
      const connect = new elementTools.Connect({
        x: '100%',
        y: '50%',
        magnet: 'body'
      });
      const elementToolsView = new dia.ToolsView({
        tools: [remove, connect]
      });
      elementView.addTools(elementToolsView);
    }).on('element:mouseleave', (elementView) => {
      elementView.removeTools();
    }).on('element:button:pointerclick', (view: dia.CellView) => {
      const type = view.model.get('type');
      if (type === Collapse.type) {
        const collapse = view.model as Collapse;
        collapse.toggle();
        if (collapse.isCollapsed()) {
          // Add a temporary link between "connected but not embedded" node and the collapsed group
          from(collapse.getEmbeddedCells()).pipe(
            filter(cell => cell.isElement()),
            concatMap(element => this.graph.getConnectedLinks(element).filter(link => !link.isEmbedded())),
            concatMap(unembeddedLink => of(unembeddedLink.getSourceCell(), unembeddedLink.getTargetCell())),
            filter(cell => cell !== null && !cell.isEmbeddedIn(collapse)),
            distinct(),
          ).subscribe(cell => {
            if (!cell) return;
            const link = new shapes.standard.Link({
              source: cell,
              target: collapse,
              _tmp_for_collapsed: true,
              attrs: {
                line: {
                  stroke: 'gray',
                  strokeWidth: 1,
                  strokeDasharray: '4',
                  sourceMarker: {
                    stroke: 'transparent',
                    fill: 'transparent'
                  },
                  targetMarker: {
                    stroke: 'transparent',
                    fill: 'transparent'
                  },
                },
              }
            });
            this.graph.addCell(link);
          });
        } else {
          this.graph.getConnectedLinks(collapse)
            .filter(link => link.prop('_tmp_for_collapsed'))
            .forEach(link => link.remove());
        }
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

    this.graph.addCell(rect);
  }

  addGroup() {
    this.groupPosition = (this.groupPosition += 10) % 200 + 200;

    const group = new Group({
      position: { x: this.groupPosition, y: this.groupPosition },
      attrs: {
        label: {
          text: `Group ${++this.groupCount}`
        }
      }
    });

    this.graph.addCell(group);
  }

  addCollapse() {
    this.collapsePosition = (this.collapsePosition += 10) % 300 + 300;

    const collapse = new Collapse({
      position: { x: this.collapsePosition, y: this.collapsePosition },
      attrs: {
        headerLabel: {
          text: `Collapse ${++this.collapseCount}`,
        },
      }
    });
    collapse.toggle(false);

    this.graph.addCell(collapse);
  }

  addLazyLoadCollapse() {
    this.collapsePosition = (this.collapsePosition += 10) % 300 + 300;
    const collapse = new Collapse({
      lazyLoad: true,
      position: { x: this.collapsePosition, y: this.collapsePosition },
      size: { width: 200, height: 200 },
      attrs: {
        headerLabel: {
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
    collapse.toggle(true);

    this.graph.addCell(collapse);
  }
}
