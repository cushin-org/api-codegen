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
  shims: true,
  treeshake: true,
  onSuccess: async () => {
    // Add shebang to CLI file after build
    const fs = await import('fs');
    const path = await import('path');
    const cliPath = path.join(process.cwd(), 'dist/cli.js');
    const content = fs.readFileSync(cliPath, 'utf-8');
    if (!content.startsWith('#!/usr/bin/env node')) {
      fs.writeFileSync(cliPath, `#!/usr/bin/env node\n${content}`);
    }
  },
});
