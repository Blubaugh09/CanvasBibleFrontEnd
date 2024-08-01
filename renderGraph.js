import Sigma from 'sigma';
import Graph from 'graphology';

export function initializeGraph(containerId) {
  console.log('Initializing graph...');
  const graph = new Graph();
  const container = document.getElementById(containerId);

  // Log container to ensure it's being found
  console.log('Container:', container);

  if (!container) {
    console.error('Container not found!');
    return;
  }

  const renderer = new Sigma(graph, container);

  console.log('Adding nodes...');
  const nodes = [
    { id: 'n1', x: 0, y: 0, size: 15, label: 'Jesus', info: 'Savior', color: '#FFD700' },
  ];

  nodes.forEach(node => {
    graph.addNode(node.id, node);
    console.log(`Node added: ${JSON.stringify(node)}`);
  });

  console.log('Graph initialized.');
}
