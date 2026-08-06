const sharp = require('sharp');
const path = require('path');

const WIDTH = 1024;
const HEIGHT = 500;

function createFeatureGraphicSvg() {
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0505"/>
      <stop offset="45%" stop-color="#3d1208"/>
      <stop offset="100%" stop-color="#5c1a0e"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FF9933"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="50%" r="42%">
      <stop offset="0%" stop-color="#FF9933" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#FF9933" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <circle cx="820" cy="250" r="170" fill="none" stroke="#FF9933" stroke-width="2" opacity="0.25"/>
  <circle cx="820" cy="250" r="130" fill="rgba(0,0,0,0.18)"/>
  <text x="820" y="235" text-anchor="middle" font-family="Georgia, serif" font-size="118" font-weight="700" fill="url(#gold)">108</text>
  <text x="820" y="310" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#FFD700">&#x0950;</text>
  <text x="72" y="190" font-family="Georgia, serif" font-size="72" font-weight="700" fill="url(#gold)">108 Counter</text>
  <text x="72" y="245" font-family="Arial, sans-serif" font-size="28" fill="#FFF8E7" opacity="0.92">Mala · Naam jaap · Shlokas · Calendar</text>
  <text x="72" y="295" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,248,231,0.72)">Daily sadhana, calm and respectful</text>
  <rect x="72" y="330" width="280" height="4" rx="2" fill="#FF9933" opacity="0.55"/>
</svg>`;
}

async function main() {
  const projectPath = path.join(__dirname, '..', 'assets', 'play-feature-graphic.png');
  const png = await sharp(Buffer.from(createFeatureGraphicSvg())).png().toBuffer();
  await sharp(png).toFile(projectPath);
  console.log('Created:', projectPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
