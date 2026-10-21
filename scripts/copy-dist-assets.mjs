import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist!');
  process.exit(1);
}

// 1. Copy js/bundle.js and js folder to dist/js
const distJsDir = path.resolve(distDir, 'js');
if (!fs.existsSync(distJsDir)) fs.mkdirSync(distJsDir, { recursive: true });
if (fs.existsSync(path.resolve(rootDir, 'js', 'bundle.js'))) {
  fs.copyFileSync(
    path.resolve(rootDir, 'js', 'bundle.js'),
    path.resolve(distJsDir, 'bundle.js')
  );
  console.log('✓ Copied js/bundle.js to dist/js/bundle.js');
}

// 2. Copy data folder to dist/data
const distDataDir = path.resolve(distDir, 'data');
if (!fs.existsSync(distDataDir)) fs.mkdirSync(distDataDir, { recursive: true });
if (fs.existsSync(path.resolve(rootDir, 'data'))) {
  fs.cpSync(path.resolve(rootDir, 'data'), distDataDir, { recursive: true });
  console.log('✓ Copied data/ to dist/data/');
}

// 3. Copy assets subdirectories to dist/assets (images, brand, fonts, videos, uploads)
const distAssetsDir = path.resolve(distDir, 'assets');
if (!fs.existsSync(distAssetsDir)) fs.mkdirSync(distAssetsDir, { recursive: true });

const assetFolders = ['brand', 'fonts', 'images', 'uploads', 'videos'];
for (const folder of assetFolders) {
  const src = path.resolve(rootDir, 'assets', folder);
  const dest = path.resolve(distAssetsDir, folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ Copied assets/${folder} to dist/assets/${folder}`);
  }
}

console.log('✨ All dist static assets synchronized successfully!');
