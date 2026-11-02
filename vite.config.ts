import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: './',
  server: {
    port: 5175,
  },
  build: {
    target: 'esnext',
  },
});
