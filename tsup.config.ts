import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    'runtime/client': 'src/runtime/client.ts',
    'config/index': 'src/config/index.ts',
    'config/schema': 'src/config/schema.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  external: [
    'react',
    'next',
    '@tanstack/react-query',
    'ky',
    'zod',
  ],
  banner: {
    js: '#!/usr/bin/env node',
  },
  shims: true,
  treeshake: true,
});
