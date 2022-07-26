import { dia, shapes } from 'jointjs';

const headerHeight = 24;
const buttonSize = 16;
const primaryColor = '#333333';
const onPrimaryColor = '#FFFFFF';

export class Collapse extends dia.Element {
  static readonly type = 'app.Collapse';

  override defaults() {
    return {
      ...super.defaults,
      type: Collapse.type,
      size: { width: 200, height: 200 },
      collapsed: false,
      expandedSize: null,
      lazyLoad: false,
      attrs: {
        body: {
          width: 'calc(w)',
          height: 'calc(h)',
          strokeWidth: 2,
          stroke: primaryColor,
          fill: 'transparent',
        },
        header: {
          width: 'calc(w)',
          height: headerHeight,
          fill: primaryColor,
        },
        headerLabel: {
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          x: 8,
          y: headerHeight / 2,
          fontSize: 14,
          fill: onPrimaryColor,
        },
        button: {
          refDx: - buttonSize - (headerHeight - buttonSize) / 2 - 4,
          refY: (headerHeight - buttonSize) / 2,
          cursor: 'pointer',
          event: 'element:button:pointerclick',
          title: 'Collapse / Expand'
        },
        buttonBorder: {
          width: buttonSize,
          height: buttonSize,
          fill: 'transparent',
          stroke: onPrimaryColor,
          strokeWidth: 1,
        },
        buttonIcon: {
          fill: 'none',
          stroke: onPrimaryColor,
          strokeWidth: 1
        },
        loading: {
          textVerticalAnchor: 'middle',
          textAnchor: 'middle',
          x: 'calc(0.5*w)',
          y: 'calc(0.5*h)',
          fontSize: 14,
          text: 'Loading...',
          visibility: 'hidden',
        }
      }
    }
  }

  override markup = [
    {
      tagName: 'rect',
      selector: 'body',
    }, {
      tagName: 'rect',
      selector: 'header',
    }, {
      tagName: 'text',
      selector: 'headerLabel',
    }, {
      tagName: 'g',
      selector: 'button',
      children: [{
        tagName: 'rect',
        selector: 'buttonBorder'
      }, {
        tagName: 'path',
        selector: 'buttonIcon'
      }]
    }, {
      tagName: 'text',
      selector: 'loading',
    }
  ];

  isCollapsed(): boolean {
    return Boolean(this.get('collapsed'));
  }

  toggle(shouldCollapse?: boolean) {
    let buttonD;
    const collapsed = (shouldCollapse === undefined) ? !this.isCollapsed() : shouldCollapse;
    if (collapsed) {
      buttonD = 'M 2 7 12 7 M 7 2 7 12';
      this.set('expandedSize', this.get('size'));
      this.resize(140, headerHeight);
    } else {
      buttonD = 'M 2 7 12 7';
      if (this.get('expandedSize')) {
        this.resize(this.get('expandedSize').width, this.get('expandedSize').height);
      }
      if (this.get('lazyLoad') && this.getEmbeddedCells().length === 0) {
        this.attr('loading/visibility', 'visible');
        this.trigger('lazyload');
      }
    }
    this.attr('buttonIcon/d', buttonD);
    this.set('collapsed', collapsed);
  }
}

Object.assign(shapes, {
  app: {
    Collapse
  }
});
