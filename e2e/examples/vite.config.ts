import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/huge-nx-e2e',
  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    testTimeout: 1000 * 60 * 5,
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: { reportsDirectory: '../../dist/coverage/examples-e2e', provider: 'v8' },
    globalSetup: '../utils/global-setup.ts',
  },
});
