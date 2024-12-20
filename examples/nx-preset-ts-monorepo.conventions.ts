import { defineConventions } from '@huge-nx/conventions';

export default defineConventions({
  version: '1.0',
  generators: {
    '@nx/js:lib': {
      linter: 'eslint',
      bundler: 'swc',
      unitTestRunner: 'jest',
    },
  },
  projectTypes: {
    'global:ts:lib:package': {
      projectPattern: '*-package',
      generators: [{ generator: '@nx/js:lib' }],
    },
  },
  workspace: {
    packages: {
      'my-package': 'global:ts:lib:package',
    },
  },
});
