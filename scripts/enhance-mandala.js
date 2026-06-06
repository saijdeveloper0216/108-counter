const path = require('path');
const sharp = require('sharp');

const input = path.join(__dirname, '../assets/jaap-mandala.png');
const output = path.join(__dirname, '../assets/jaap-mandala-enhanced.png');

sharp(input)
  .trim({ threshold: 24, background: '#f5f5f5' })
  .modulate({ brightness: 1.06, saturation: 1.45 })
  .linear(1.42, -42)
  .sharpen({ sigma: 1.1, m1: 0.8, m2: 0.35 })
  .png({ quality: 95 })
  .toFile(output)
  .then((info) => {
    console.log('Enhanced mandala written:', output, info);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
