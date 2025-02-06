import { defineConventions } from '@huge-nx/conventions';

export default defineConventions({
  version: '1.0',
  generators: {
    '@nx/next:application': {
      linter: 'eslint',
      style: 'css',
      unitTestRunner: 'jest',
      e2eTestRunner: 'playwright',
      appDir: true,
      src: true,
      useTsSolution: true,
    },
    '@nx/next:library': {
      linter: 'eslint',
      style: 'css',
      bundler: 'vite',
      unitTestRunner: 'jest',
      useTsSolution: true,
    },
    '@nx/next:component': {
      style: 'css',
    },
    '@nx/js:lib': {
      linter: 'eslint',
      bundler: 'swc',
      unitTestRunner: 'jest',
    },
  },
  projectTypes: {
    'global:next:app': {
      projectPattern: '*-app',
      generators: [{ generator: '@nx/next:application' }],
    },
    'global:next:lib:data-access': {
      projectPattern: '*-data-access',
      generators: [{ generator: '@nx/next:library' }],
    },
    'global:next:lib:feature': {
      projectPattern: '*-feature',
      generators: [{ generator: '@nx/next:library' }],
    },
    'global:next:lib:ui': {
      projectPattern: '*-ui',
      generators: [{ generator: '@nx/next:library' }],
    },
    'global:ts:lib:utils': {
      projectPattern: '*-utils',
      generators: [{ generator: '@nx/js:lib', options: { bundler: 'swc' } }],
    },
  },
  workspace: {
    apps: {
      'hotel-app': 'global:next:app',
    },
    libs: {
      guest: {
        'data-access': 'global:next:lib:data-access',
        'booking-feature': 'global:next:lib:feature',
        'feedback-feature': 'global:next:lib:feature',
      },
      room: {
        'data-access': 'global:next:lib:data-access',
        'list-feature': 'global:next:lib:feature',
        'request-feature': 'global:next:lib:feature',
      },
      shared: {
        ui: 'global:next:lib:ui',
        utils: 'global:ts:lib:utils',
      },
    },
  },
});
