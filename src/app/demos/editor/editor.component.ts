import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { dia, elementTools, shapes, util } from 'jointjs';
import { concatMap, distinct, filter, firstValueFrom, from, timer } from 'rxjs';

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

        // Prevent loop
        if (cellViewS === cellViewT || magnetS === magnetT) return false;

        // Limit 1 link between two elements
        const linkCount = this.graph.getConnectedLinks(cellViewS.model)
          .filter(link => link.id !== linkView.model.id)
          .reduce((pre, cur) => {
            return pre + util.intersection(
              [cur.getSourceCell()?.id, cur.getTargetCell()?.id],
              [cellViewS.model.id, cellViewT.model.id]
            ).length === 2 ? 1 : 0;
          }, 0);
        if (linkCount > 0) {
          return false;
        }

        // Allow all other connections
        return true;
      },
      // Embedding
      embeddingMode: true,
      validateEmbedding: function (childView, parentView) {
        const parentType = parentView.model.get('type');
        const childType = childView.model.get('type');
        if (parentType === Group.type && childType === 'standard.Rectangle') return true;
        if (parentType === Collapse.type && childType === 'standard.Rectangle') return true;
        return false;
      },
      viewport: (view) => {
        const model: dia.Cell = view.model;

        // Hide element or link that is descendant of a collapsed collapse
        if (Collapse.isDescendantOfCollapsedCollapse(model)) return false;

        if (model.isLink()) {
          const link = model as dia.Link;
          const endCells = [link.getSourceCell(), link.getTargetCell()];
          // Hide link with at least one end that is descendant of a collapsed collapse
          if (endCells.some(Collapse.isDescendantOfCollapsedCollapse)) return false;
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
          // Temporarily connect unembedded elements
          // (that are connected to the embedded elements but not in any collapsed collapse) to the collapsed collapse.
          // Original links are hidden by the `viewport` callback of `paper`.
          from(collapse.getEmbeddedCells()).pipe(
            filter(cell => cell.isElement()),
            concatMap(element => this.graph.getConnectedLinks(element).filter(link => !link.isEmbedded())),
            concatMap(unembeddedLink => [unembeddedLink.getSourceCell(), unembeddedLink.getTargetCell()]),
            filter(cell => cell !== null && !Collapse.isDescendantOfCollapsedCollapse(cell)),
            distinct(),
          ).subscribe((cell) => {
            console.log(cell);
            if (!cell) return;
            const link = new shapes.standard.Link({
              source: cell,
              target: collapse,
              _temp_for_collapsed: true,
              attrs: {
                line: {
                  stroke: 'gray',
                  strokeWidth: 2,
                  strokeDasharray: '4',
                  sourceMarker: {
                    display: 'none',
                  },
                  targetMarker: {
                    display: 'none',
                  },
                },
              }
            });
            this.graph.addCell(link);
          });
        } else {
          this.graph.getConnectedLinks(collapse)
            .filter(link => link.prop('_temp_for_collapsed'))
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
