import { build } from 'esbuild';

await build({
  entryPoints: ['server/src/serverless.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/index.js',
  external: ['pg-native'],
  banner: {
    js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);"
  }
});

console.log('Built api/index.js successfully');

