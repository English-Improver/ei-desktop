const svg2png = require('svg2png');
const pngToIco = require('png-to-ico');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
    try {
        // Read SVG file
        const svgBuffer = await fs.readFile(path.join(__dirname, '../resources/icon.svg'));
        
        // Convert SVG to PNG
        const pngBuffer = await svg2png(svgBuffer, { width: 1024, height: 1024 });
        await fs.writeFile(path.join(__dirname, '../resources/icon.png'), pngBuffer);
        
        // Convert PNG to ICO
        const icoBuffer = await pngToIco([path.join(__dirname, '../resources/icon.png')]);
        await fs.writeFile(path.join(__dirname, '../resources/icon.ico'), icoBuffer);
        
        console.log('Icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
