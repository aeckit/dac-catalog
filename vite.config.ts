import { defineConfig } from 'vite';
import solidPlugin from '@solidjs/vite-plugin';
import path from 'node:path';
import fs from 'node:fs';

const localDacSolidDist = path.resolve(import.meta.dirname, '../dac/packages/dac-solid/dist/index.js');
const useLocalDacSolid = fs.existsSync(localDacSolidDist);

export default defineConfig({
  plugins: [solidPlugin()],
  base: './',
  resolve: {
    alias: {
      'solid-js/web': '@solidjs/web',
      ...(useLocalDacSolid ? { '@aeckit/dac-solid': localDacSolidDist } : {}),
    },
  },
  server: {
    port: 5175,
  },
  build: {
    target: 'esnext',
  },
});
