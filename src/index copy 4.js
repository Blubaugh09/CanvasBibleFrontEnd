import Sigma from 'sigma';
import Graph from 'graphology';
import chroma from 'chroma-js';

export function initializeGraph(containerId) {
  console.log('Initializing graph...');
  const graph = new Graph();
  const container = document.getElementById(containerId);
  const renderer = new Sigma(graph, container);

  console.log('Adding nodes...');
  const nodes = [
    { id: 'n1', x: 0, y: 0, size: 15, label: 'Jesus', info: 'Savior', color: '#FFD700' },
    { id: 'n2', x: 0, y: 1, size: 10, label: 'Savior', info: 'Jesus as Savior', color: '#4682B4' },
    { id: 'n3', x: 0, y: 2, size: 10, label: 'King', info: 'Jesus as King', color: '#5F9EA0' },
    { id: 'n4', x: 0, y: 3, size: 10, label: 'Redemption', info: 'Jesus as Redeemer', color: '#7FFFD4' },
    { id: 'n5', x: 0, y: 4, size: 10, label: 'Sacrificial Lamb', info: 'Jesus as Sacrificial Lamb', color: '#66CDAA' },
    { id: 'n6', x: -1, y: 0, size: 10, label: 'Isaiah 7:14', info: 'Prophecy of a virgin birth', color: '#FF8C00' },
    { id: 'n7', x: -2, y: 0, size: 10, label: 'Micah 5:2', info: 'Prophecy of birth in Bethlehem', color: '#FFA500' },
    { id: 'n8', x: -3, y: 0, size: 10, label: 'Zechariah 9:9', info: 'Prophecy of triumphant entry', color: '#FFD700' },
    { id: 'n9', x: -4, y: 0, size: 10, label: 'Isaiah 53:3-5', info: 'Prophecy of suffering servant', color: '#FFFF00' },
    { id: 'n10', x: 1, y: 0, size: 10, label: 'Matthew 1:23', info: 'Fulfillment of virgin birth', color: '#7FFF00' },
    { id: 'n11', x: 2, y: 0, size: 10, label: 'Matthew 2:1', info: 'Fulfillment of birth in Bethlehem', color: '#00FF00' },
    { id: 'n12', x: 3, y: 0, size: 10, label: 'John 12:15', info: 'Fulfillment of triumphant entry', color: '#32CD32' },
    { id: 'n13', x: 4, y: 0, size: 10, label: '1 Peter 2:24', info: 'Fulfillment of suffering servant', color: '#3CB371' },
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

  nodes.forEach(node => {
    graph.addNode(node.id, node);
    console.log(`Node added: ${JSON.stringify(node)}`);
  });

  console.log('Adding edges...');
  const edges = [
    { from: 'n1', to: 'n2', size: 3, label: 'Role', info: 'Jesus -> Savior', color: '#000000' },
    { from: 'n1', to: 'n6', size: 3, label: 'Prophecy', info: 'Jesus -> Isaiah 7:14', color: '#000000' },
    { from: 'n1', to: 'n10', size: 3, label: 'Fulfillment', info: 'Jesus -> Matthew 1:23', color: '#000000' },
    { from: 'n1', to: 'n14', size: 3, label: 'Lineage', info: 'Jesus -> Joseph', color: '#000000' },
    { from: 'n1', to: 'n15', size: 3, label: 'Lineage', info: 'Jesus -> Mary', color: '#000000' },
    { from: 'n2', to: 'n3', size: 3, label: 'Role', info: 'Savior -> King', color: '#000000' },
    { from: 'n3', to: 'n4', size: 3, label: 'Role', info: 'King -> Redemption', color: '#000000' },
    { from: 'n4', to: 'n5', size: 3, label: 'Role', info: 'Redemption -> Sacrificial Lamb', color: '#000000' },
    { from: 'n6', to: 'n7', size: 3, label: 'Prophecy', info: 'Isaiah 7:14 -> Micah 5:2', color: '#000000' },
    { from: 'n7', to: 'n8', size: 3, label: 'Prophecy', info: 'Micah 5:2 -> Zechariah 9:9', color: '#000000' },
    { from: 'n8', to: 'n9', size: 3, label: 'Prophecy', info: 'Zechariah 9:9 -> Isaiah 53:3-5', color: '#000000' },
    { from: 'n10', to: 'n11', size: 3, label: 'Fulfillment', info: 'Matthew 1:23 -> Matthew 2:1', color: '#000000' },
    { from: 'n11', to: 'n12', size: 3, label: 'Fulfillment', info: 'Matthew 2:1 -> John 12:15', color: '#000000' },
    { from: 'n12', to: 'n13', size: 3, label: 'Fulfillment', info: 'John 12:15 -> 1 Peter 2:24', color: '#000000' },
    { from: 'n14', to: 'n16', size: 3, label: 'Lineage', info: 'Joseph -> David', color: '#000000' },
    { from: 'n15', to: 'n16', size: 3, label: 'Lineage', info: 'Mary -> David', color: '#000000' },
    { from: 'n16', to: 'n17', size: 3, label: 'Lineage', info: 'David -> Judah', color: '#000000' },
    { from: 'n17', to: 'n18', size: 3, label: 'Lineage', info: 'Judah -> Jacob', color: '#000000' },
    { from: 'n18', to: 'n19', size: 3, label: 'Lineage', info: 'Jacob -> Isaac', color: '#000000' },
    { from: 'n19', to: 'n20', size: 3, label: 'Lineage', info: 'Isaac -> Abraham', color: '#000000' },
    { from: 'n20', to: 'n21', size: 3, label: 'Lineage', info: 'Abraham -> Noah', color: '#000000' },
    { from: 'n21', to: 'n22', size: 3, label: 'Lineage', info: 'Noah -> Adam', color: '#000000' },
  ];

  edges.forEach(edge => {
    graph.addEdge(edge.from, edge.to, edge);
    console.log(`Edge added: ${JSON.stringify(edge)}`);
  });
  console.log('Graph initialized.');
}
