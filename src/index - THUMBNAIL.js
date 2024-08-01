import Sigma from 'sigma';
import Graph from 'graphology';
import ForceSupervisor from 'graphology-layout-force/worker';
import FileSaver from 'file-saver';

/**
 * Function to save Sigma.js graph as a PNG image.
 */
async function saveAsPNG(renderer, inputLayers) {
  const { width, height } = renderer.getDimensions();
  const pixelRatio = window.devicePixelRatio || 1;

  const tmpRoot = document.createElement("DIV");
  tmpRoot.style.width = `${width}px`;
  tmpRoot.style.height = `${height}px`;
  tmpRoot.style.position = "absolute";
  tmpRoot.style.right = "101%";
  tmpRoot.style.bottom = "101%";
  document.body.appendChild(tmpRoot);

  const tmpRenderer = new Sigma(renderer.getGraph(), tmpRoot, renderer.getSettings());
  tmpRenderer.getCamera().setState(renderer.getCamera().getState());
  tmpRenderer.refresh();

  const canvas = document.createElement("CANVAS");
  canvas.setAttribute("width", width * pixelRatio + "");
  canvas.setAttribute("height", height * pixelRatio + "");
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width * pixelRatio, height * pixelRatio);

  const canvases = tmpRenderer.getCanvases();
  const layers = inputLayers ? inputLayers.filter((id) => !!canvases[id]) : Object.keys(canvases);
  layers.forEach((id) => {
    ctx.drawImage(
      canvases[id],
      0,
      0,
      width * pixelRatio,
      height * pixelRatio,
      0,
      0,
      width * pixelRatio,
      height * pixelRatio
    );
  });

  canvas.toBlob((blob) => {
    if (blob) FileSaver.saveAs(blob, "graph.png");

    tmpRenderer.kill();
    tmpRoot.remove();
  }, "image/png");
}

// Check if the Sigma renderer has already been initialized
if (!window.sigmaRendererInitialized) {
  const graph = new Graph();
  console.log('Graph instance created');

  const nodes = [
    { id: 'n1', x: 0, y: 0, size: 15, label: 'Jesus', info: 'Savior', color: '#FFD700' },
  ];
  nodes.forEach(node => graph.addNode(node.id, node));

  const container = document.getElementById('sigma-container');
  const layout = new ForceSupervisor(graph, { isNodeFixed: (_, attr) => attr.highlighted });
  layout.start();

  const renderer = new Sigma(graph, container, {});

  const state = {
    hoveredNode: null,
    hoveredNeighbors: new Set(),
  };

  document.getElementById('save-button').addEventListener('click', () => saveAsPNG(renderer));

  window.sigmaRendererInitialized = true;
}
