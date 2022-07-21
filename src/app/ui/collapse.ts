import { dia } from 'jointjs';

const headerHeight = 24;
const buttonSize = 16;

export const Collapse = dia.Element.define('ui.Collapse', {
  collapsed: false,
  expandedSize: null,
  lazyLoad: false,
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      strokeWidth: 2,
      stroke: '#333333',
      fill: 'transparent',
    },
    header: {
      width: 'calc(w)',
      height: headerHeight,
      fill: '#333333',
    },
    headerText: {
      textVerticalAnchor: 'middle',
      textAnchor: 'start',
      x: 8,
      y: headerHeight / 2,
      fontSize: 14,
      fill: '#FFFFFF',
    },
    button: {
      refDx: - buttonSize - (headerHeight - buttonSize) / 2,
      refY: (headerHeight - buttonSize) / 2,
      cursor: 'pointer',
      event: 'element:button:pointerclick',
      title: 'Collapse / Expand'
    },
    buttonBorder: {
      width: buttonSize,
      height: buttonSize,
      fill: 'transparent',
      stroke: '#FFFFFF',
      strokeWidth: 1,
    },
    buttonIcon: {
      fill: 'none',
      stroke: '#FFFFFF',
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
}, {
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    }, {
      tagName: 'rect',
      selector: 'header',
    }, {
      tagName: 'text',
      selector: 'headerText',
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
  ],

  isCollapsed: function () {
    return Boolean(this.get('collapsed'));
  },

  toggle: function (shouldCollapse?: boolean) {
    let buttonD;
    const collapsed = (shouldCollapse === undefined) ? !this.get('collapsed') : shouldCollapse;
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
    this.attr(['buttonIcon', 'd'], buttonD);
    this.set('collapsed', collapsed);
  },
});
