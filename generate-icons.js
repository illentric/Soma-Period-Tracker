const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512, 1024];

async function drawIcon(size, logoImg) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 1024;

  // Background with rounded corners
  const r = 224 * s;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#2C1A0E');
  grad.addColorStop(1, '#5C3317');
  ctx.fillStyle = grad;
  ctx.fill();

  const cx = 512 * s;
  const cy = 420 * s;

  // Decorative circle
  ctx.strokeStyle = 'rgba(245,200,66,0.12)';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(cx, cy, 260 * s, 0, Math.PI * 2);
  ctx.stroke();

  // Logo image centered
  const logoSize = 420 * s;
  ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);

  // Cycle ring
  const ringR = 200 * s;
  ctx.lineWidth = 14 * s;
  ctx.lineCap = 'round';
  const segments = [
    { start: -Math.PI / 2, end: Math.PI * 0.12, color: '#B5341A' },
    { start: Math.PI * 0.15, end: Math.PI * 0.62, color: '#2E8B57' },
    { start: Math.PI * 0.65, end: Math.PI * 0.92, color: '#D4A017' },
    { start: Math.PI * 0.95, end: Math.PI * 1.47, color: '#7B5EA7' },
  ];
  segments.forEach(seg => {
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, seg.start, seg.end);
    ctx.strokeStyle = seg.color;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // "SOMA" text
  const fontSize = Math.max(10, Math.round(80 * s));
  ctx.font = `bold ${fontSize}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textGrad = ctx.createLinearGradient(300 * s, 0, 724 * s, 0);
  textGrad.addColorStop(0, '#F5C842');
  textGrad.addColorStop(1, '#D4A017');
  ctx.fillStyle = textGrad;
  ctx.fillText('SOMA', 512 * s, 740 * s);

  if (size >= 192) {
    const subSize = Math.max(8, Math.round(26 * s));
    ctx.font = `${subSize}px Arial, sans-serif`;
    ctx.fillStyle = '#C8B8A2';
    ctx.letterSpacing = `${4 * s}px`;
    ctx.fillText('AYURVEDIC PERIOD TRACKING', 512 * s, 800 * s);
  }

  return canvas;
}

async function main() {
  const logoImg = await loadImage('icons/soma-logo.png');
  for (const size of sizes) {
    const canvas = await drawIcon(size, logoImg);
    fs.writeFileSync(`icons/icon-${size}.png`, canvas.toBuffer('image/png'));
    console.log(`Generated icon-${size}.png`);
  }
  console.log('All icons generated!');
}

main().catch(console.error);
