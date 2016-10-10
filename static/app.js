cy = null;

conopts = {
  name: 'concentric',

  fit: true, // whether to fit the viewport to the graph
  padding: 30, // the padding on fit
  startAngle: 3 / 2 * Math.PI, // where nodes start in radians
  sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
  clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
  equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
  minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  height: undefined, // height of layout area (overrides container height)
  width: undefined, // width of layout area (overrides container width)
  concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
  return node.degree();
  },
  levelWidth: function( nodes ){ // the variation of concentric values in each level
  return nodes.maxDegree() / 4;
  },
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  ready: undefined, // callback on layoutready
  stop: undefined // callback on layoutstop
};

breadopts = {
  name: 'breadthfirst',

  fit: true, // whether to fit the viewport to the graph
  directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
  padding: 30, // padding on fit
  circle: false, // put depths in concentric circles if true, put depths top down if false
  spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  roots: undefined, // the roots of the trees
  maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  ready: undefined, // callback on layoutready
  stop: undefined // callback on layoutstop
};

cosopts = {
  name: 'cose',

  // Called on `layoutready`
  ready: function(){},

  // Called on `layoutstop`
  stop: function(){},

  // Whether to animate while running the layout
  animate: true,

  // The layout animates only after this many milliseconds
  // (prevents flashing on fast runs)
  animationThreshold: 250,

  // Number of iterations between consecutive screen positions update
  // (0 -> only updated on the end)
  refresh: 20,

  // Whether to fit the network view after when done
  fit: true,

  // Padding on fit
  padding: 30,

  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,

  // Randomize the initial positions of the nodes (true) or use existing positions (false)
  randomize: false,

  // Extra spacing between components in non-compound graphs
  componentSpacing: 100,

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: function( node ){ return 400000; },

  // Node repulsion (overlapping) multiplier
  nodeOverlap: 10,

  // Ideal edge (non nested) length
  idealEdgeLength: function( edge ){ return 10; },

  // Divisor to compute edge forces
  edgeElasticity: function( edge ){ return 100; },

  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 5,

  // Gravity force (constant)
  gravity: 80,

  // Maximum number of iterations to perform
  numIter: 1000,

  // Initial temperature (maximum node displacement)
  initialTemp: 200,

  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.95,

  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0,

  // Whether to use threading to speed up the layout
  useMultitasking: true
};

layout = "bread";
lhash = {"bread":breadopts,
         "cos": cosopts,
        "cons": conopts}

function dolay(lay){
  window.layout = lay
  cy.layout(lhash[lay]);
}

function add(source_id){
  var eles = cy.add([
    { group: "nodes", data: { id: source_id+ "0" }},
  { group: "nodes", data: { id: source_id + "1" }},
  { group: "edges", data: { id: source_id + "e0", source: source_id + "0", target: source_id, label: 'arf' }, classes: 'autorotate'},
  { group: "edges", data: { id: source_id + "e1", source: source_id + "1", target: source_id }}
  ]);
  //console.log('added', eles);
  cy.layout(lhash[layout]);
  expand(source_id)
  eles.on('cxttap', function(e){
     var ele = e.cyTarget;
     add(ele.id())
     console.log('clicked ' + ele.id());
  });
};

function expand(source_id){
  $.get( "/n?id="+source_id, function( data ) {
    console.log(data)
    eles = []
    $.each(data.nodes,function(i,n){
      console.log(n.label,n.scaled_size)
      eles.push({ group: "nodes",data: n})
    })
   $.each(data.edges,function(i,n){
      eles.push({ group: "edges",data: n,classes: 'autorotate'})
    })
   eles =  cy.add(eles)
   cy.layout(lhash[layout]);
   eles.on('cxttap', function(e){
     var ele = e.cyTarget;
     expand(ele.id())
     console.log('clicked ' + ele.id());
    });
  });
}

$(function(){ // on dom ready

cy = cytoscape({
  container: document.getElementById('cy'),
  
  boxSelectionEnabled: false,
  autounselectify: true,
  
  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(id)',
        'text-valign': 'center',
        'label': 'data(label)',
        'text-halign': 'center',
        'height': 'data(scaled_size)',
        'width': 'data(scaled_size)'
      }
    },
    {
      selector: '$node > node',
      css: {
        'padding-top': '10px',
        'padding-left': '10px',
        'padding-bottom': '10px',
        'padding-right': '10px',
        'text-valign': 'top',
        'text-halign': 'center',
        'background-color': '#bbb'
      }
    },
    {
      selector: 'edge',
      css: {
        'label': 'data(label)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    },
    {
              selector: '.autorotate',
              style: {
                'edge-text-rotation': 'autorotate'
              }
            },
    {
      selector: ':selected',
      css: {
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      }
    }
  ],
  
  elements: {
    nodes: [
      //{ data: { id: 'a', parent: 'b' }, position: { x: 215, y: 85 } },
      //{ data: { id: 'b' } },
      //{ data: { id: 'c', parent: 'b' }, position: { x: 300, y: 85 } },
      //{ data: { id: 'd' }, position: { x: 215, y: 175 } },
      //{ data: { id: 'e' } },
      //{ data: { id: 'f', parent: 'e' }, position: { x: 300, y: 175 } }
      {data: { id: 8,name: "root",size: 1,scaled_size: 20}}
    ],
    edges: [
      //{ data: { id: 'ad', source: 'a', target: 'd' } },
      //{ data: { id: 'eb', source: 'e', target: 'b' } }
      
    ]
  },
  
  layout: {
    name: 'preset',
    padding: 5
  }
});
  cy.$('node').on('cxttap', function(e){
     var ele = e.cyTarget;
     expand(ele.id())
     console.log('clicked ' + ele.id());
  });
  
}); // on dom ready
