import Sigma from 'sigma';
import Graph from 'graphology';
import ForceSupervisor from 'graphology-layout-force/worker';
import chroma from 'chroma-js';
import { v4 as uuid } from 'uuid';

// Check if the Sigma renderer has already been initialized
if (!window.sigmaRendererInitialized) {
  // Create a new Graph
  const graph = new Graph();

  console.log('Graph instance created');

// Add nodes and edges to the graph (complex example)
const nodes = [
  { id: 'n1', x: 0, y: 0, size: 15, label: 'Jesus', info: 'Savior', color: '#FFD700' },
 
];

nodes.forEach(node => graph.addNode(node.id, node));



  const container = document.getElementById('sigma-container');


  // Create the spring layout and start it
  const layout = new ForceSupervisor(graph, { isNodeFixed: (_, attr) => attr.highlighted });
  layout.start();

  // Initialize the renderer
  const renderer = new Sigma(graph, container, {

  });


  // Internal state to track hovered node and neighbors
  const state = {
    hoveredNode: null,
    hoveredNeighbors: new Set(),
  };





  // Set a flag to indicate the renderer has been initialized
  window.sigmaRendererInitialized = true;
}
