const sharp = require('sharp');
const path = require('path');

const SIZE = 1024;
const center = SIZE / 2;

function beadDots(count = 108, ringRadius = 360, beadRadius = 10) {
  let dots = '';
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = center + ringRadius * Math.cos(angle);
    const y = center + ringRadius * Math.sin(angle);
    dots += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${beadRadius}" fill="#FFD700" opacity="0.95"/>`;
  }
  return dots;
}

function createIconSvg() {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#6b1d12"/>
      <stop offset="55%" stop-color="#3d1208"/>
      <stop offset="100%" stop-color="#1a0505"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="45%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FF9933"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" rx="224" ry="224" fill="url(#bg)"/>
  <circle cx="${center}" cy="${center}" r="390" fill="none" stroke="#FF9933" stroke-width="3" opacity="0.25"/>
  ${beadDots()}
  <circle cx="${center}" cy="${center}" r="250" fill="rgba(0,0,0,0.22)"/>
  <text x="${center}" y="${center - 10}" text-anchor="middle" font-family="Georgia, serif" font-size="220" font-weight="700" fill="url(#gold)" filter="url(#glow)">108</text>
  <text x="${center}" y="${center + 120}" text-anchor="middle" font-family="Georgia, serif" font-size="88" fill="#FFD700" opacity="0.95">&#x0950;</text>
</svg>`;
}

function createForegroundSvg() {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FF9933"/>
    </linearGradient>
  </defs>
  ${beadDots(108, 330, 9)}
  <text x="${center}" y="${center - 8}" text-anchor="middle" font-family="Georgia, serif" font-size="210" font-weight="700" fill="url(#gold)">108</text>
  <text x="${center}" y="${center + 110}" text-anchor="middle" font-family="Georgia, serif" font-size="80" fill="#FFD700">&#x0950;</text>
</svg>`;
}

function createMonochromeSvg() {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  ${beadDots(108, 330, 9).replace(/#FFD700/g, '#FFFFFF')}
  <text x="${center}" y="${center - 8}" text-anchor="middle" font-family="Georgia, serif" font-size="210" font-weight="700" fill="#FFFFFF">108</text>
  <text x="${center}" y="${center + 110}" text-anchor="middle" font-family="Georgia, serif" font-size="80" fill="#FFFFFF">&#x0950;</text>
</svg>`;
}

async function writePng(svg, filePath, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(filePath);
}

async function main() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  const iconSvg = createIconSvg();
  await writePng(iconSvg, path.join(assetsDir, 'icon.png'), 1024);
  await writePng(iconSvg, path.join(assetsDir, 'splash-icon.png'), 1024);
  await writePng(createForegroundSvg(), path.join(assetsDir, 'android-icon-foreground.png'), 1024);
  await writePng(
    `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="#1a0505"/></svg>`,
    path.join(assetsDir, 'android-icon-background.png'),
    1024,
  );
  await writePng(createMonochromeSvg(), path.join(assetsDir, 'android-icon-monochrome.png'), 1024);
  await writePng(iconSvg, path.join(assetsDir, 'favicon.png'), 48);
  console.log('Generated app icons in assets/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
