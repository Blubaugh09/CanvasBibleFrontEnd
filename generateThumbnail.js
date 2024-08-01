const puppeteer = require('puppeteer');
const path = require('path');

async function generateThumbnail() {
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log('Setting page content...');
    await page.setContent(`
        <html>
            <body>
                <div id="sigma-container" style="width: 800px; height: 600px;"></div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/graphology/0.23.1/graphology.umd.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/sigma/build/sigma.min.js"></script>
                <script type="module">
                    import { initializeGraph } from './renderGraph.js';
                    window.graphState = { firstGraph: { graph: null, renderer: null } };
                    initializeGraph('sigma-container');
                    console.log('Graph state:', window.graphState.firstGraph);
                </script>
            </body>
        </html>
    `);

    console.log('Waiting for graph to render...');
    await page.waitForSelector('#sigma-container');

    console.log('Adding delay...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Capturing screenshot...');
    const element = await page.$('#sigma-container');
    await element.screenshot({ path: 'thumbnail.png' });
    await browser.close();
    console.log('Thumbnail generated successfully.');
}

generateThumbnail().catch(console.error);
