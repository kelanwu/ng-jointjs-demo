import { dia, elementTools, g } from "jointjs";
import { Group } from "./group";

export class Selection {
  private paper: dia.Paper;
  private graph: dia.Graph;

  private selectionEl: HTMLDivElement;
  private selectionWrapperEl: HTMLDivElement;
  private mousemoveHandler: ((evt: MouseEvent) => void) | null = null;

  private selectedViews: dia.ElementView[] | null = null;
  private selectedRect: g.Rect | null = null;

  constructor(options: Selection.Options) {
    this.paper = options.paper;
    this.graph = options.graph;

    this.selectionEl = document.createElement('div');
    this.selectionEl.classList.add('joint-selection', 'joint-theme-material');
    this.selectionEl.style.pointerEvents = 'none';
    this.paper.el.appendChild(this.selectionEl);

    this.selectionWrapperEl = document.createElement('div');
    this.selectionWrapperEl.classList.add('selection-wrapper');
    this.selectionEl.appendChild(this.selectionWrapperEl);

    const removeHandleEl = document.createElement('div');
    removeHandleEl.className = 'handle nw';
    removeHandleEl.textContent = '+Group';
    removeHandleEl.addEventListener('click', () => this.onGroupElements());
    this.selectionWrapperEl.appendChild(removeHandleEl);
  }

  cancelSelection(): void {
    this.selectionEl.classList.remove('lasso', 'selected');
    this.selectionEl.style.width = '';
    this.selectionEl.style.height = '';

    this.selectionWrapperEl.setAttribute('data-selection-length', '0');

    if (this.mousemoveHandler) {
      this.paper.el.removeEventListener('mousemove', this.mousemoveHandler);
      this.mousemoveHandler = null;
    }

    this.selectedViews = null;
    this.selectedRect = null;
  }

  startSelecting(evt: dia.Event): void {
    this.cancelSelection();

    const start = new g.Point(evt.offsetX, evt.offsetY);
    this.selectionEl.style.left = `${start.x}px`;
    this.selectionEl.style.top = `${start.y}px`;
    this.selectionEl.classList.add('lasso');

    this.mousemoveHandler = (evt: MouseEvent) => {
      const end = new g.Point(evt.offsetX, evt.offsetY);
      const rect = g.Rect.fromPointUnion(start, end);

      this.selectionEl.style.left = `${rect?.x}px`;
      this.selectionEl.style.top = `${rect?.y}px`;
      this.selectionEl.style.width = `${rect?.width}px`;
      this.selectionEl.style.height = `${rect?.height}px`;
    };

    this.paper.el.addEventListener('mousemove', this.mousemoveHandler);

    this.paper.el.addEventListener('mouseup', evt => {
      this.cancelSelection();

      const end = new g.Point(evt.offsetX, evt.offsetY);
      const rect = g.Rect.fromPointUnion(start, end);
      if (!rect) { return; }

      // Filter group and embeded elements
      const views = this.paper.findViewsInArea(rect).filter(view => view.model.get('type') !== 'ui.Group' && !view.model.isEmbedded());
      if (views.length === 0) { return; }

      this.selectionEl.classList.add('selected');
      this.selectionWrapperEl.setAttribute('data-selection-length', views.length.toString());
      const wrapperRect = g.Rect.fromRectUnion(...views.map(view => view.getBBox()));
      this.selectionWrapperEl.style.left = `${wrapperRect?.x}px`;
      this.selectionWrapperEl.style.top = `${wrapperRect?.y}px`;
      this.selectionWrapperEl.style.width = `${wrapperRect?.width}px`;
      this.selectionWrapperEl.style.height = `${wrapperRect?.height}px`;

      this.selectedViews = views;
      this.selectedRect = wrapperRect;
    }, { once: true });

    // this.paper.el.addEventListener('mousedown', () => this.cancelSelection(), { once: true });
  }

  protected onGroupElements() {
    if (!this.selectedViews || !this.selectedRect) { return; }

    // Emit an event instead?
    const group = new Group();
    group.position(this.selectedRect.x - 10, this.selectedRect.y - 10);
    group.resize(this.selectedRect.width + 20, this.selectedRect.height + 20);
    group.embed(this.selectedViews.map(view => view.model));

    const removeButton = new elementTools.Remove();
    const elementToolsView = new dia.ToolsView({
      tools: [removeButton]
    });

    this.graph.addCell(group);
    group.findView(this.paper).addTools(elementToolsView);
    this.paper.hideTools();

    this.cancelSelection();
  }
}

export namespace Selection {
  export interface Options {
    paper: dia.Paper;
    graph: dia.Graph;
  }
}

// Copy from rappid.d.ts

// class Selection extends mvc.View<dia.Cell> {

//   constructor(options?: Selection.Options);

//   cancelSelection(): void;

//   addHandle(opt?: Selection.Handle): this;

//   stopSelecting(evt: dia.Event): void;

//   removeHandle(name: string): this;

//   startSelecting(evt: dia.Event): void;

//   changeHandle(name: string, opt?: Selection.Handle): this;

//   translateSelectedElements(dx: number, dy: number): void;

//   hide(): void;

//   render(): this;

//   destroySelectionBox(cell: dia.Cell): void;

//   createSelectionBox(cell: dia.Cell): void;

//   protected onSelectionBoxPointerDown(evt: dia.Event): void;

//   protected startTranslatingSelection(evt: dia.Event): void;

//   protected pointerup(evt: dia.Event): void;

//   protected showSelected(): void;

//   protected destroyAllSelectionBoxes(): void;

//   protected onHandlePointerDown(evt: dia.Event): void;

//   protected pointermove(evt: dia.Event): void;

//   protected onRemoveElement(element: dia.Element): void;

//   protected onResetElements(elements: dia.Element): void;

//   protected onAddElement(element: dia.Element): void;
// }

// namespace Selection {

//   export interface Options extends mvc.ViewOptions<undefined> {
//     paper: dia.Paper;
//     graph?: dia.Graph;
//     boxContent?: boolean | string | HTMLElement | JQuery | ((boxElement: HTMLElement) => string | HTMLElement | JQuery);
//     handles?: Array<Handle>;
//     useModelGeometry?: boolean;
//     strictSelection?: boolean;
//     rotateAngleGrid?: number;
//     allowTranslate?: boolean;
//     collection?: any;
//     filter?: ((cell: dia.Cell) => boolean) | Array<string | dia.Cell>;
//   }

//   export interface Handle {
//     name: string;
//     position?: HandlePosition;
//     events?: HandleEvents;
//     attrs?: any;
//     icon?: string;
//     content?: string | HTMLElement | JQuery
//   }

//   enum HandlePosition {
//     N = 'n', NW = 'nw',
//     W = 'w', SW = 'sw',
//     S = 's', SE = 'se',
//     E = 'e', NE = 'ne'
//   }

//   export interface HandleEvents {
//     pointerdown?: string | ((evt: dia.Event) => void);
//     pointermove?: string | ((evt: dia.Event) => void);
//     pointerup?: string | ((evt: dia.Event) => void);
//   }
// }
