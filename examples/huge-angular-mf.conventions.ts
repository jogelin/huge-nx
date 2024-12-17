import { defineConventions } from '@huge-nx/conventions';

export default defineConventions({
  version: '1.0',
  generators: {
    '@nx/angular:application': {
      linter: 'eslint',
      style: 'css',
      unitTestRunner: 'jest',
      bundler: 'esbuild',
      e2eTestRunner: 'playwright',
      inlineStyle: true,
      inlineTemplate: true,
      ssr: false,
    },
    '@nx/angular:host': {
      style: 'css',
      linter: 'eslint',
      unitTestRunner: 'jest',
      e2eTestRunner: 'playwright',
    },
    '@nx/angular:remote': {
      style: 'css',
      linter: 'eslint',
      unitTestRunner: 'jest',
      e2eTestRunner: 'playwright',
    },
    '@nx/angular:library': {
      style: 'css',
      linter: 'eslint',
      unitTestRunner: 'jest',
    },
    '@nx/angular:component': {
      style: 'css',
      linter: 'eslint',
      unitTestRunner: 'jest',
    },
    '@nx/js:lib': {
      linter: 'eslint',
      bundler: 'swc',
      unitTestRunner: 'jest',
    },
    '@nx/storybook:configuration': {
      interactionTests: 'true',
    },
  },
  projectTypes: {
    'global:angular:app': {
      projectPattern: '*-app',
      generators: [{ generator: '@nx/angular:application' }],
    },
    'mf:host:app': {
      projectPattern: '*-host',
      generators: [{ generator: '@nx/angular:host', options: { addTailwind: true } }],
    },
    'mf:remote:app': {
      projectPattern: 'mf_*_remote',
      generators: [{ generator: '@nx/angular:remote' }],
    },
    'global:angular:lib:data-access': {
      projectPattern: '*-data-access',
      generators: [{ generator: '@nx/angular:library' }],
    },
    'global:angular:lib:feature': {
      projectPattern: '*-feature',
      generators: [{ generator: '@nx/angular:library' }],
    },
    'global:angular:lib:ui': {
      projectPattern: '*-ui',
      generators: [{ generator: '@nx/angular:library' }],
    },
    'global:angular:lib:ui:storybook': {
      projectPattern: '*-ui',
      generators: [{ generator: '@nx/angular:library' }, { generator: '@nx/storybook:configuration', options: { uiFramework: '@storybook/angular' } }],
    },
    'global:angular:lib:utils': {
      projectPattern: '*-utils',
      generators: [{ generator: '@nx/angular:library' }],
    },
    'global:ts:lib:utils': {
      projectPattern: '*-utils',
      generators: [{ generator: '@nx/js:lib', options: { bundler: 'swc' } }],
    },
  },
  workspace: {
    apps: {
      'hotel-host': 'mf:host:app',
      mf_guest_services_remote: {
        projectType: 'mf:remote:app',
        options: {
          '@nx/angular:remote': { host: 'hotel-host' },
        },
      },
      mf_room_maintenance_remote: {
        projectType: 'mf:remote:app',
        options: {
          '@nx/angular:remote': { host: 'hotel-host' },
        },
      },
      mf_event_management_remote: {
        projectType: 'mf:remote:app',
        options: {
          '@nx/angular:remote': { host: 'hotel-host' },
        },
      },
      'admin-dashboard-app': 'global:angular:app',
    },
    libs: {
      guest: {
        'data-access': 'global:angular:lib:data-access',
        'booking-feature': 'global:angular:lib:feature',
        'feedback-feature': 'global:angular:lib:feature',
        ui: 'global:angular:lib:ui',
        utils: 'global:ts:lib:utils',
      },
      staff: {
        'data-access': 'global:angular:lib:data-access',
        'list-feature': 'global:angular:lib:feature',
        'scheduling-feature': 'global:angular:lib:feature',
        ui: 'global:angular:lib:ui',
        utils: 'global:ts:lib:utils',
      },
      room: {
        'data-access': 'global:angular:lib:data-access',
        'list-feature': 'global:angular:lib:feature',
        'request-feature': 'global:angular:lib:feature',
        ui: 'global:angular:lib:ui',
        utils: 'global:ts:lib:utils',
      },
      events: {
        'data-access': 'global:angular:lib:data-access',
        'booking-feature': 'global:angular:lib:feature',
        'management-feature': 'global:angular:lib:feature',
        ui: 'global:angular:lib:ui',
        utils: 'global:ts:lib:utils',
      },
      shared: {
        ui: {
          projectType: 'global:angular:lib:ui:storybook',
          options: {
            '@nx/storybook:configuration': { project: 'shared-ui' },
          },
        },
        utils: 'global:ts:lib:utils',
      },
    },
  },
});
