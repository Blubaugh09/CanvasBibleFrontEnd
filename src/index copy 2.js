import Sigma from 'sigma';
import Graph from 'graphology';
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
}

if (!window.sigmaRendererInitialized) {
  window.graphState = {
    firstGraph: { graph: null, renderer: null },
    secondGraph: { graph: null, renderer: null }
  };
  
  initializeGraph('sigma-container', window.graphState.firstGraph);
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
