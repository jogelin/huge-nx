import { defineConventions } from '@huge-nx/conventions';

export default defineConventions({
  version: '1.0',
  generators: {
    '@nx/angular:application': {
      bundler: 'esbuild',
    },
  },
  projectTypes: {
    'global:angular:application': {
      projectPattern: '*-app',
      generators: [{ generator: '@nx/angular:application' }],
    },
  },
  workspace: {
    apps: {
      'my-app': 'global:angular:application',
    },
  },
});
