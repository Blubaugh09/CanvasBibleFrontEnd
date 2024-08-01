import Sigma from 'sigma';
import Graph from 'graphology';
import ForceSupervisor from 'graphology-layout-force/worker';
import chroma from 'chroma-js';
import { v4 as uuid } from 'uuid';
function initializeGraph(containerId, graphState) {
  const graph = new Graph();
  const container = document.getElementById(containerId);
  const renderer = new Sigma(graph, container, {
    renderEdgeLabels: true,
    enableEdgeEvents: true,
  });

  graphState.graph = graph;
  graphState.renderer = renderer;

  const state = {
    hoveredNode: null,
    hoveredNeighbors: new Set(),
  };

  let draggedNode = null;
  let isDragging = false;
  let initialPosition = null;

  renderer.on("downNode", (e) => {
    isDragging = true;
    draggedNode = e.node;
    initialPosition = { x: graph.getNodeAttribute(draggedNode, 'x'), y: graph.getNodeAttribute(draggedNode, 'y') };
    graph.setNodeAttribute(draggedNode, "highlighted", true);
  });

  renderer.getMouseCaptor().on("mousemovebody", (e) => {
    if (!isDragging || !draggedNode) return;
    const pos = renderer.viewportToGraph(e);
    graph.setNodeAttribute(draggedNode, "x", pos.x);
    graph.setNodeAttribute(draggedNode, "y", pos.y);
    e.preventSigmaDefault();
    e.original.preventDefault();
    e.original.stopPropagation();
  });

  renderer.getMouseCaptor().on("mouseup", () => {
    if (draggedNode) {
      const finalPosition = { x: graph.getNodeAttribute(draggedNode, 'x'), y: graph.getNodeAttribute(draggedNode, 'y') };
      const distance = Math.sqrt(Math.pow(finalPosition.x - initialPosition.x, 2) + Math.pow(finalPosition.y - initialPosition.y, 2));
      if (distance < 5) {
        const nodeData = graph.getNodeAttributes(draggedNode);
        document.getElementById('nodeModalLabel').innerText = nodeData.label;
        document.getElementById('nodeModalBody').innerHTML = `
          <p><strong>Label:</strong> ${nodeData.label}</p>
          <p><strong>Color:</strong> <span style="color:${nodeData.color}">${nodeData.color}</span></p>
          <p><strong>Size:</strong> ${nodeData.size}</p>
          <p><strong>Notes:</strong> ${nodeData.info}</p>
        `;
        $('#nodeModal').modal('show');
      }
      graph.removeNodeAttribute(draggedNode, "highlighted");
    }
    isDragging = false;
    draggedNode = null;
    initialPosition = null;
  });

  renderer.getMouseCaptor().on("mousedown", () => {
    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
  });

  renderer.on('clickEdge', ({ edge }) => {
    const edgeData = graph.getEdgeAttributes(edge);
    const [source, target] = graph.extremities(edge);
    const sourceData = graph.getNodeAttributes(source);
    const targetData = graph.getNodeAttributes(target);
    const sourceLabel = sourceData.label || source;
    const targetLabel = targetData.label || target;

    document.getElementById('edgeModalLabel').innerText = edgeData.label;
    document.getElementById('edgeModalBody').innerHTML = `
      <p><strong>Label:</strong> ${edgeData.label}</p>
      <p><strong>Source Node:</strong> ${sourceLabel}</p>
      <p><strong>Target Node:</strong> ${targetLabel}</p>
      <p><strong>Color:</strong> <span style="color:${edgeData.color}">${edgeData.color}</span></p>
      <p><strong>Size:</strong> ${edgeData.size}</p>
      <p><strong>Info:</strong> ${edgeData.info}</p>
    `;
    $('#edgeModal').modal('show');
  });

  renderer.on('enterNode', ({ node }) => {
    state.hoveredNode = node;
    state.hoveredNeighbors = new Set(graph.neighbors(node));
    renderer.refresh();
  });

  renderer.on('leaveNode', () => {
    state.hoveredNode = null;
    state.hoveredNeighbors = new Set();
    renderer.refresh();
  });

  renderer.setSetting('nodeReducer', (node, data) => {
    const res = { ...data };
    if (state.hoveredNode && node !== state.hoveredNode && !state.hoveredNeighbors.has(node)) {
      res.label = '';
      res.color = '#f6f6f6';
    }
    return res;
  });

  renderer.setSetting('edgeReducer', (edge, data) => {
    const res = { ...data };
    if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
      res.hidden = true;
    }
    return res;
  });

  // Check the number of nodes and update the "Add Edge" button state
  function updateAddEdgeButton() {
    const addEdgeButton = document.getElementById('add-edge');
    if (graph.order > 1) {
      addEdgeButton.disabled = false;
    } else {
      addEdgeButton.disabled = true;
    }
  }

  updateAddEdgeButton();

  graph.on('nodeAdded', updateAddEdgeButton);
  graph.on('nodeDropped', updateAddEdgeButton);

  // Add a node by clicking on the graph
  renderer.on("clickStage", (e) => {
    const pos = renderer.viewportToGraph(e);
    document.getElementById('nodeX').value = pos.x.toFixed(2);
    document.getElementById('nodeY').value = pos.y.toFixed(2);
    $('#addNodeModal').modal('show');
  });
}

if (!window.sigmaRendererInitialized) {
  window.graphState = {
    firstGraph: { graph: null, renderer: null },
    secondGraph: { graph: null, renderer: null }
  };

  initializeGraph('sigma-container', window.graphState.firstGraph);

  const graph = window.graphState.firstGraph.graph;

  const nodes = [
    // Center node
    { id: 'n1', x: 0, y: 0, size: 15, label: 'Jesus', info: 'Savior', color: '#FFD700' },
    
    // Vertical Line (Above Jesus, Key Ideas)
    { id: 'n2', x: 0, y: 1, size: 10, label: 'Savior', info: 'Jesus as Savior', color: '#4682B4' },
    { id: 'n3', x: 0, y: 2, size: 10, label: 'King', info: 'Jesus as King', color: '#5F9EA0' },
    { id: 'n4', x: 0, y: 3, size: 10, label: 'Redemption', info: 'Jesus as Redeemer', color: '#7FFFD4' },
    { id: 'n5', x: 0, y: 4, size: 10, label: 'Sacrificial Lamb', info: 'Jesus as Sacrificial Lamb', color: '#66CDAA' },
    
    // Horizontal Line (Left of Jesus, Prophecies)
    { id: 'n6', x: -1, y: 0, size: 10, label: 'Isaiah 7:14', info: 'Prophecy of a virgin birth', color: '#FF8C00' },
    { id: 'n7', x: -2, y: 0, size: 10, label: 'Micah 5:2', info: 'Prophecy of birth in Bethlehem', color: '#FFA500' },
    { id: 'n8', x: -3, y: 0, size: 10, label: 'Zechariah 9:9', info: 'Prophecy of triumphant entry', color: '#FFD700' },
    { id: 'n9', x: -4, y: 0, size: 10, label: 'Isaiah 53:3-5', info: 'Prophecy of suffering servant', color: '#FFFF00' },
    
    // Horizontal Line (Right of Jesus, Fulfillments)
    { id: 'n10', x: 1, y: 0, size: 10, label: 'Matthew 1:23', info: 'Fulfillment of virgin birth', color: '#7FFF00' },
    { id: 'n11', x: 2, y: 0, size: 10, label: 'Matthew 2:1', info: 'Fulfillment of birth in Bethlehem', color: '#00FF00' },
    { id: 'n12', x: 3, y: 0, size: 10, label: 'John 12:15', info: 'Fulfillment of triumphant entry', color: '#32CD32' },
    { id: 'n13', x: 4, y: 0, size: 10, label: '1 Peter 2:24', info: 'Fulfillment of suffering servant', color: '#3CB371' },
    
    // Vertical Line (Below Jesus, Lineage)
    { id: 'n14', x: -0.5, y: -1, size: 10, label: 'Joseph', info: 'Father of Jesus', color: '#9400D3' },
    { id: 'n15', x: 0.5, y: -1, size: 10, label: 'Mary', info: 'Mother of Jesus', color: '#8A2BE2' },
    { id: 'n16', x: 0, y: -2, size: 10, label: 'David', info: 'King', color: '#9932CC' },
    { id: 'n17', x: 0, y: -3, size: 10, label: 'Judah', info: 'Tribe of Judah', color: '#DB7093' },
    { id: 'n18', x: 0, y: -4, size: 10, label: 'Jacob', info: 'Son of Isaac', color: '#C71585' },
    { id: 'n19', x: 0, y: -5, size: 10, label: 'Isaac', info: 'Son of Abraham', color: '#FF1493' },
    { id: 'n20', x: 0, y: -6, size: 10, label: 'Abraham', info: 'Patriarch', color: '#FF69B4' },
    { id: 'n21', x: 0, y: -7, size: 10, label: 'Noah', info: 'Built the Ark', color: '#FF6347' },
    { id: 'n22', x: 0, y: -8, size: 10, label: 'Adam', info: 'First Man', color: '#FF4500' },
  ];

  nodes.forEach(node => graph.addNode(node.id, node));

  const edges = [
    // Center node connections
    { from: 'n1', to: 'n2', size: 3, label: 'Role', info: 'Jesus -> Savior', color: '#000000' },
    { from: 'n1', to: 'n6', size: 3, label: 'Prophecy', info: 'Jesus -> Isaiah 7:14', color: '#000000' },
    { from: 'n1', to: 'n10', size: 3, label: 'Fulfillment', info: 'Jesus -> Matthew 1:23', color: '#000000' },
    { from: 'n1', to: 'n14', size: 3, label: 'Lineage', info: 'Jesus -> Joseph', color: '#000000' },
    { from: 'n1', to: 'n15', size: 3, label: 'Lineage', info: 'Jesus -> Mary', color: '#000000' },

    // Vertical connections (Above Jesus)
    { from: 'n2', to: 'n3', size: 3, label: 'Role', info: 'Savior -> King', color: '#000000' },
    { from: 'n3', to: 'n4', size: 3, label: 'Role', info: 'King -> Redemption', color: '#000000' },
    { from: 'n4', to: 'n5', size: 3, label: 'Role', info: 'Redemption -> Sacrificial Lamb', color: '#000000' },

    // Horizontal connections (Left of Jesus, Prophecies)
    { from: 'n6', to: 'n7', size: 3, label: 'Prophecy', info: 'Isaiah 7:14 -> Micah 5:2', color: '#000000' },
    { from: 'n7', to: 'n8', size: 3, label: 'Prophecy', info: 'Micah 5:2 -> Zechariah 9:9', color: '#000000' },
    { from: 'n8', to: 'n9', size: 3, label: 'Prophecy', info: 'Zechariah 9:9 -> Isaiah 53:3-5', color: '#000000' },

    // Horizontal connections (Right of Jesus, Fulfillments)
    { from: 'n10', to: 'n11', size: 3, label: 'Fulfillment', info: 'Matthew 1:23 -> Matthew 2:1', color: '#000000' },
    { from: 'n11', to: 'n12', size: 3, label: 'Fulfillment', info: 'Matthew 2:1 -> John 12:15', color: '#000000' },
    { from: 'n12', to: 'n13', size: 3, label: 'Fulfillment', info: 'John 12:15 -> 1 Peter 2:24', color: '#000000' },

    // Vertical connections (Below Jesus, Lineage)
    { from: 'n14', to: 'n16', size: 3, label: 'Lineage', info: 'Joseph -> David', color: '#000000' },
    { from: 'n15', to: 'n16', size: 3, label: 'Lineage', info: 'Mary -> David', color: '#000000' },
    { from: 'n16', to: 'n17', size: 3, label: 'Lineage', info: 'David -> Judah', color: '#000000' },
    { from: 'n17', to: 'n18', size: 3, label: 'Lineage', info: 'Judah -> Jacob', color: '#000000' },
    { from: 'n18', to: 'n19', size: 3, label: 'Lineage', info: 'Jacob -> Isaac', color: '#000000' },
    { from: 'n19', to: 'n20', size: 3, label: 'Lineage', info: 'Isaac -> Abraham', color: '#000000' },
    { from: 'n20', to: 'n21', size: 3, label: 'Lineage', info: 'Abraham -> Noah', color: '#000000' },
    { from: 'n21', to: 'n22', size: 3, label: 'Lineage', info: 'Noah -> Adam', color: '#000000' },
  ];

  edges.forEach(edge => graph.addEdge(edge.from, edge.to, edge));

  initializeGraph('sigma-container-2', window.graphState.secondGraph);

  window.sigmaRendererInitialized = true;
}

function resetForm(formId) {
  document.getElementById(formId).reset();
}

function disableFormButtons(formId, disabled) {
  const form = document.getElementById(formId);
  const buttons = form.querySelectorAll('button');
  buttons.forEach(button => button.disabled = disabled);
}

document.getElementById('addNodeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  disableFormButtons('addNodeForm', true);
  addNode(false);
});

document.getElementById('saveAndAddAnotherNode').addEventListener('click', (e) => {
  e.preventDefault();
  disableFormButtons('addNodeForm', true);
  addNode(true);
});

function addNode(addAnother) {
  const nodeId = uuid();
  const label = document.getElementById('nodeLabel').value;
  const color = document.getElementById('nodeColor').value;
  const size = document.getElementById('nodeSize').value;
  const notes = document.getElementById('nodeNotes').value;
  const x = parseFloat(document.getElementById('nodeX').value);
  const y = parseFloat(document.getElementById('nodeY').value);

  if (!label) {
    console.error('Node label is empty. Aborting node addition.');
    disableFormButtons('addNodeForm', false);
    return;
  }

  console.log('Adding node:', { nodeId, label, color, size, notes, x, y });

  if (!window.graphState.secondGraph.graph.hasNode(nodeId)) {
    window.graphState.secondGraph.graph.addNode(nodeId, {
      x,
      y,
      size: parseFloat(size),
      label,
      info: notes,
      color,
    });

    window.graphState.secondGraph.renderer.refresh();
    console.log('Node added:', window.graphState.secondGraph.graph.getNodeAttributes(nodeId));
    
    if (!addAnother) {
      $('#addNodeModal').modal('hide');
    }
    resetForm('addNodeForm');
    disableFormButtons('addNodeForm', false);
  } else {
    console.warn('Node with this ID already exists:', nodeId);
    disableFormButtons('addNodeForm', false);
  }
}

document.getElementById('addEdgeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  disableFormButtons('addEdgeForm', true);
  addEdge(false);
});

document.getElementById('saveAndAddAnotherEdge').addEventListener('click', (e) => {
  e.preventDefault();
  disableFormButtons('addEdgeForm', true);
  addEdge(true);
});

function addEdge(addAnother) {
  const from = document.getElementById('startNode').value;
  const to = document.getElementById('endNode').value;
  const label = document.getElementById('edgeLabel').value;
  const color = document.getElementById('edgeColor').value;
  const size = document.getElementById('edgeSize').value;

  console.log('Adding edge:', { from, to, label, color, size });

  if (window.graphState.secondGraph.graph.hasNode(from) && window.graphState.secondGraph.graph.hasNode(to)) {
    if (!window.graphState.secondGraph.graph.hasEdge(from, to)) {
      window.graphState.secondGraph.graph.addEdge(from, to, {
        size: parseFloat(size),
        label,
        info: 'Information about the edge',
        color,
      });

      window.graphState.secondGraph.renderer.refresh();
      console.log('Edge added:', window.graphState.secondGraph.graph.getEdgeAttributes(from, to));
    } else {
      console.warn(`Edge from ${from} to ${to} already exists.`);
    }
    
    if (!addAnother) {
      $('#addEdgeModal').modal('hide');
    }
    resetForm('addEdgeForm');
    disableFormButtons('addEdgeForm', false);
  } else {
    alert('One of the nodes does not exist.');
    disableFormButtons('addEdgeForm', false);
  }
}

document.getElementById('add-edge').addEventListener('click', () => {
  const nodes = window.graphState.secondGraph.graph.nodes();
  const startNodeSelect = document.getElementById('startNode');
  const endNodeSelect = document.getElementById('endNode');

  startNodeSelect.innerHTML = '';
  endNodeSelect.innerHTML = '';

  nodes.forEach(node => {
    const nodeData = window.graphState.secondGraph.graph.getNodeAttributes(node);
    const option = document.createElement('option');
    option.value = node;
    option.text = nodeData.label || node; // Fallback to node ID if label is missing
    startNodeSelect.appendChild(option);
    endNodeSelect.appendChild(option.cloneNode(true));
  });
});
