// eslint-disable-next-line @nx/enforce-module-boundaries
import { defineConventions } from '@huge-nx/conventions';

export default defineConventions({
  version: '1.0',
  generators: {
    '@nx/angular:application': {
      bundler: 'vite',
    },
  },
  projectTypes: {
    'global:react:application': {
      projectPattern: '*-app',
      generators: [{ generator: '@nx/react:application' }],
    },
  },
  workspace: {
    apps: {
      'my-app': 'global:react:application',
    },
  },
});
