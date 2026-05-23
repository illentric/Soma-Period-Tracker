// Soma — Copyright (c) 2026 Shailja Dubey. All Rights Reserved.
const fs = require('fs');
const { minify } = require('html-minifier-terser');

const COPYRIGHT = '/* (c) 2026 Shailja Dubey. All Rights Reserved. Unauthorized copying prohibited. */\n';

async function build() {
  const files = ['index.html', 'privacy.html', 'terms.html', 'splash.html'];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');

    const minified = await minify(src, {
      collapseWhitespace: true,
      removeComments: false,
      minifyCSS: true,
      minifyJS: {
        mangle: {
          toplevel: true,
          reserved: ['saveCycle', 'clearAll', 'toggleMood', 'toggleSymptom',
                     'saveCheckin', 'switchTab', 'prevMonth', 'nextMonth',
                     'switchPhaseView', 'showToast']
        },
        compress: {
          drop_console: true,
          passes: 2
        }
      },
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    });

    fs.writeFileSync(`www/${file}`, minified);
    const savings = Math.round((1 - minified.length / src.length) * 100);
    console.log(`${file}: ${src.length} -> ${minified.length} bytes (${savings}% smaller)`);
  }

  // Minify service worker
  const swSrc = fs.readFileSync('sw.js', 'utf8');
  fs.writeFileSync('www/sw.js', COPYRIGHT + swSrc);

  // Copy manifest and icons
  fs.cpSync('manifest.json', 'www/manifest.json');
  fs.cpSync('icons', 'www/icons', { recursive: true });

  console.log('\nProduction build complete!');
}

build().catch(console.error);
