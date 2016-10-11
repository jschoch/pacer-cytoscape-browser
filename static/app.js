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

function bind_expand_nodes(e){
  var ele = e.cyTarget;
  ele.data({_expanded: true});
  expand(ele);
}
function bind_expand_ft(e){
  var ele = e.cyTarget;
  var ft = ele.data().freq_type
  var parent = ele.neighborhood()[0]
  console.log("bef",ele.data(),ft,parent.data())
  expand(parent,ft)
}

function expand(ele,filter_type){
  var source_id = ele.id();
  var tfs = ele.neighborhood(".freq_type")
  tfs.each(function(i,e){
    cy.remove(e);
  })
  url = "/n?id="+source_id;
  if (filter_type){
    url = "/n?id="+source_id+"&type="+filter_type
  }

  $.get( url, function( data ) {
    //console.log(data)
    var eles = []
    var fts = []
    $.each(data.nodes,function(i,n){
      //console.log(n.label,n.scaled_size,n)
      if (n.id == source_id) return null

      eles.push({ group: "nodes",data: n})
      if (n.p.type_freq == null){
        console.log( "no freq");
        return null
      }
      var tf = n.p.type_freq
      
      $.each(JSON.parse(tf),function(k,v){
        console.log("key",k);
        add_freq_types(fts,n,k,v);
      });
    })
    $.each(data.edges,function(i,n){
      eles.push({ group: "edges",data: n,classes: 'autorotate'})
    })
   eles =  cy.add(eles);
   fts = cy.add(fts);
   fts.on("cxttap",bind_expand_ft)
   cy.layout(lhash[layout]);
   eles.on('cxttap', bind_expand_nodes);
   add_qtip(eles);
  });
}

function add_node(id){
  $.get( "/v?id="+id, function( data ) {
    node = dress_node(data);
    var x = cy.add(node);
    x.on("cxttap",bind_expand_nodes);
    add_qtip([x]);
    cy.layout(lhash[layout]);
  })
}

function dress_node(data){
  var dn = default_node();
  var t = {}
  dn.data = $.extend(t,dn.data,data);
  dn.data.faveColor = 'grey'
  //console.log('dress node',dn,data)
  return dn
}
function default_node(){
  return {
    group: "nodes",
    data: {
      id: 'default',
      _expanded: false,
      size: 20,
      scaled_size: 20,
      faveColor: 'green',
      label: "Default Label"
      }
  }
}

function remove_freq_type(source,key){
  var s = cy.$("node[id = '"+ "freq_type:" + key + ":" + source.id +  "']")
  var edges = s.connectedEdges(s)
  edges.each(function(i,e){
    var er = cy.remove(e)
    console.log("edge r",er)
  })
  var r = cy.remove(s)
}

function add_freq_types(eles,source,key,val){
  var target = "freq_type:" + key + ":" + source.id
  var node = default_node();
  node.data.id = target;
  node.data.label = key + '(' + val + ')';
  node.classes = 'freq_type'
  node.data.faveColor= 'red'
  node.data.freq_type = key
  eles.push(node)
  eles.push(
   { 
    group: "edges",
    data: { id: "e"+target,source: source.id, target: target,label: "FT" }
   })
  console.log("pushed",eles);
  //return eles;
}

function add_qtip(eles){
  qt = {
    content: '!',
    position: {
      my: 'top center',
      at: 'bottom center'
    },
    style: {
      classes: 'qtip-bootstrap',
      tip: {
        width: 16,
        height: 8
      }
    }
  }
  $.each(eles,function(i,n){
    props = n.data().p
    if (props){
      qt.content = JSON.stringify(props,null,"<br/>");
      n.qtip(qt)
      //console.log("props",props,qt,n);
    }
  });
};

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
        'text-outline-width': 2,
        'text-outline-color': 'data(faveColor)',
        'background-color': 'data(faveColor)',
        'height': 'data(scaled_size)',
        'width': 'data(scaled_size)',
        'color': '#fff'
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
        'opacity': 0.666,
        'curve-style': 'bezier'
      }
    },
    {
      selector: '.autorotate',
        style: {
          'edge-text-rotation': 'autorotate',
          //'text-background-opacity': 1,
          //'text-background-color': '#ccc',
          //'text-background-shape': 'roundrectangle',
          //'text-border-color': '#000',
          //'text-border-width': 1,
          'text-outline-color': '#ccc',
          'text-outline-width': 3,
          'text-border-opacity': 1
          }
    },
    {
      selector: '.type_freq',
      style: {
        //'label': 'data(label)',
        //'target-arrow-shape': 'triangle',
        //'opacity': 0.666,
        //'curve-style': 'bezier'
        'background-color': 'data(faveColor)'
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
      //{data: { id: 8,name: "root",size: 1,scaled_size: 20,faveColor: '#6FB1FC'}}
    ],
    edges: [
    ]
  },
  
  layout: {
    name: 'preset',
    padding: 5
  }
});
  var root_id = "8";
  var root = add_node(root_id);
  //add_qtip([root]);
  //cy.layout(lhash[layout]);
  
  
}); // on dom ready
