// scripts/generate-icons.mjs
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public/icons/icon.svg');
const outDir = resolve(root, 'public/icons');

mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: 'icon-16.png',  size: 16  },
  { name: 'icon-32.png',  size: 32  },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

const svgBuffer = readFileSync(svgPath);

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(outDir, name));
  console.log(`✓ Generated ${name}`);
}
console.log('All icons generated.');
