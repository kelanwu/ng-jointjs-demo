# NgJointjsDemo

Tutorial, Demos for using JointJS (V3.5.5, not JointJS+) in Angular (V14) apps.

## Tutorial for using JointJS in Angular
The [JointJS Tutorials](https://resources.jointjs.com/tutorial) only has an example for integrating JointJS+ (commercial extension to JointJS) into an Angular app. This tutorial will show you how to add JointJS to an Angular project and build the "Hello World!" demo.

### Create an Angular project
Make sure Angular CLI is installed and run:

```Bash
ng new PROJECT-NAME
```

### Add JointJS to the Angular project
`cd` to the project root, update `dependencies` and `devDependencies` in the `package.json` file with the following:


```json
"dependencies": {
    ...
    "jointjs": "^3.5.5",
    ...
},
"devDependencies": {
    ...
    "@types/backbone": "^1.4.15",
    "@types/jquery": "^3.5.14",
    ...
}
```

Then, run `npm install`.

### Build the "Hello World!"
Go over [JointJS Hello World!](https://resources.jointjs.com/tutorial/hello-world) to understand how JointJS works first. Below is just using Angular to implement the same thing.

Create a new component or use the `app.component`.

Update the component template (.html) with the following:
```html
<div #myholder></div>
```

In the component class file (.ts), import the JointJS `dia`, and `shapes` namespace.
```TypeScript
import { dia, shapes } from 'jointjs';
```

After that, inside the class add the following code to get the `myholder` element:
```TypeScript
@ViewChild('myholder', { static: true }) myholder!: ElementRef;
```

Next, define a graph and a paper, create two rectangular elements, and create one link to connect the elements in the `ngOnInit` lifecycle hook:
```TypeScript
  ngOnInit(): void {
    const namespace = shapes;

    const graph = new dia.Graph({}, { cellNamespace: namespace });

    const paper = new dia.Paper({
      el: this.myholder.nativeElement,
      model: graph,
      width: 600,
      height: 100,
      gridSize: 1,
      cellViewNamespace: namespace,
    });

    const rect = new shapes.standard.Rectangle();
    rect.position(100, 30);
    rect.resize(100, 40);
    rect.attr({
      body: {
        fill: 'blue'
      },
      label: {
        text: 'Hello',
        fill: 'white'
      }
    });
    rect.addTo(graph);

    const rect2 = rect.clone();
    rect2.translate(300, 0);
    rect2.attr('label/text', 'World!');
    rect2.addTo(graph);

    const link = new shapes.standard.Link();
    link.source(rect);
    link.target(rect2);
    link.addTo(graph);
  }
```
