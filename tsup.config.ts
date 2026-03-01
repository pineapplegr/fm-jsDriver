import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // Browser library: inline fm-gofer so consumers have zero deps
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    bundle: true,
    noExternal: ['fm-gofer'],
    target: 'es2020',
    platform: 'browser',
    clean: true,
  },
  {
    // CLI schema generator: standalone Node.js script
    entry: { generator: 'src/generator.ts' },
    format: ['cjs'],
    bundle: true,
    target: 'node14',
    platform: 'node',
  },
]);
