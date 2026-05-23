const fs = require('fs');
const { createCanvas } = require('canvas');

const splashSizes = [
  { name: 'splash-2732x2732', w: 2732, h: 2732 },
  { name: 'splash-1242x2688', w: 1242, h: 2688 },
  { name: 'splash-1125x2436', w: 1125, h: 2436 },
  { name: 'splash-828x1792',  w: 828,  h: 1792  },
  { name: 'splash-1080x1920', w: 1080, h: 1920 },
  { name: 'splash-750x1334',  w: 750,  h: 1334  },
  { name: 'splash-640x1136',  w: 640,  h: 1136  },
];

function drawSplash(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#2C1A0E');
  grad.addColorStop(1, '#5C3317');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h * 0.38;
  const scale = Math.min(w, h) / 1024;

  // Decorative circle
  ctx.strokeStyle = 'rgba(245,200,66,0.12)';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, 200 * scale, 0, Math.PI * 2);
  ctx.stroke();

  // Lotus petals
  function petal(px, py, rx, ry, angle, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx + px * scale, cy + py * scale);
    ctx.rotate(angle * Math.PI / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * scale, ry * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  petal(-132, -20, 70, 160, -25, '#D4777C', 0.7);
  petal(132, -20, 70, 160, 25, '#D4777C', 0.7);
  petal(-92, -40, 65, 170, -12, '#C0392B', 0.85);
  petal(92, -40, 65, 170, 12, '#C0392B', 0.85);
  petal(0, -60, 60, 180, 0, '#A83228', 1);

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy - 90 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fillStyle = '#F5C842';
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Cycle ring
  ctx.lineWidth = 14 * scale;
  ctx.lineCap = 'round';
  const ringR = 200 * scale;
  const arcs = [
    { start: -Math.PI/2, end: Math.PI * 0.12, color: '#B5341A' },
    { start: Math.PI * 0.15, end: Math.PI * 0.62, color: '#2E8B57' },
    { start: Math.PI * 0.65, end: Math.PI * 0.92, color: '#D4A017' },
    { start: Math.PI * 0.95, end: Math.PI * 1.47, color: '#7B5EA7' },
  ];
  arcs.forEach(a => {
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, a.start, a.end);
    ctx.strokeStyle = a.color;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Title
  const titleSize = Math.round(80 * scale);
  ctx.font = `bold ${titleSize}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textGrad = ctx.createLinearGradient(cx - 150 * scale, 0, cx + 150 * scale, 0);
  textGrad.addColorStop(0, '#F5C842');
  textGrad.addColorStop(1, '#D4A017');
  ctx.fillStyle = textGrad;
  ctx.fillText('SOMA', cx, cy + 280 * scale);

  // Subtitle
  const subSize = Math.round(22 * scale);
  ctx.font = `${subSize}px Arial, sans-serif`;
  ctx.fillStyle = '#C8B8A2';
  ctx.fillText('AYURVEDIC PERIOD TRACKING', cx, cy + 330 * scale);

  return canvas;
}

if (!fs.existsSync('resources')) fs.mkdirSync('resources');

splashSizes.forEach(({ name, w, h }) => {
  const canvas = drawSplash(w, h);
  fs.writeFileSync(`resources/${name}.png`, canvas.toBuffer('image/png'));
  console.log(`Generated ${name}.png (${w}x${h})`);
});

console.log('All splash screens generated!');
