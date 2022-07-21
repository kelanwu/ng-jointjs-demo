import { dia } from 'jointjs';

export const Group = dia.Element.define('ui.Group', {
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      rx: 8,
      ry: 8,
      strokeWidth: 2,
      stroke: '#333333',
      strokeDasharray: '4,4,1',
      fill: 'transparent',
      pointerEvents: 'none',
    },
    wrapper: {
      width: 'calc(w)',
      height: 'calc(h)',
      strokeWidth: 10,
      stroke: 'transparent',
      fill: 'none',
      pointerEvents: 'stroke',
    },
    label: {
      x: 'calc(0.5*w)',
      y: 12,
      textAnchor: 'middle',
      fontSize: 14,
      fontWeight: 'bold',
    }
  },
}, {
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    }, {
      tagName: 'rect',
      selector: 'wrapper',
    }, {
      tagName: 'text',
      selector: 'label',
    }
  ]
});
