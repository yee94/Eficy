import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'reactjs-signal', 'tsyringe'],
  platform: 'browser',
  target: 'es2020',
  esbuildOptions: {
    treeshake: false,
  },
});