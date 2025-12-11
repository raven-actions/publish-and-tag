import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const outdir = 'dist';

// Clean dist directory
if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true });
}

const outfile = 'index.mjs';

const result = await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  outfile: path.join(outdir, outfile),
  minify: false, // Keep readable for debugging
  sourcemap: true,
  // Keep names for better error stack traces
  keepNames: true,
  // Banner to ensure proper ESM handling with CommonJS compatibility
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`.trim()
  },
  // Bundle everything - no external packages for self-contained GitHub Action
  external: [],
  // Generate metadata for analysis
  metafile: true,
  // Log level
  logLevel: 'info',
  // Tree shaking for smaller bundle
  treeShaking: true,
  // Legal comments in separate file
  legalComments: 'external'
});

// Write metafile for bundle analysis
fs.writeFileSync(path.join(outdir, 'meta.json'), JSON.stringify(result.metafile, null, 2));

// Calculate bundle size
const stats = fs.statSync(path.join(outdir, outfile));
const sizeKB = (stats.size / 1024).toFixed(2);
console.log(`\n✅ Build complete! Bundle size: ${sizeKB} KB`);
