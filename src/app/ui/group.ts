import { dia } from 'jointjs';


export const Group = dia.Element.define('ui.Group', {
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      rx: 10,
      ry: 10,
      strokeWidth: 2,
      stroke: '#333333',
      strokeDasharray: '4,4,1',
      fill: 'transparent',
      pointerEvents: 'none',
    },
    wrapper: {
      width: 'calc(w-10)',
      height: 'calc(h-10)',
      strokeWidth: 10,
      stroke: 'transparent',
      fill: 'none',
      transform: 'matrix(1,0,0,1,5,5)',
      pointerEvents: 'stroke',
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
    },
  ]
});
