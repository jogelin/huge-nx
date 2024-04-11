// eslint-disable-next-line @nx/enforce-module-boundaries
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
    },
    '@nx/angular:library': {
      linter: 'eslint',
      unitTestRunner: 'jest',
    },
    '@nx/angular:component': {
      style: 'css',
    },
    '@nx/js:lib': {
      bundler: 'swc',
    },
  },
  projectTypes: {
    'global:angular:app': {
      projectPattern: '*-app',
      generators: [{ generator: '@nx/angular:application' }],
    },
    'mf:host:app': {
      projectPattern: '*-app',
      generators: [{ generator: '@nx/angular:host', options: { addTailwind: true } }],
    },
    'mf:remote:app': {
      projectPattern: 'mf-*-app',
      generators: [{ generator: '@nx/angular:remote' }],
    },
    'backend:api': {
      projectPattern: '*-api',
      generators: [{ generator: '@nx/nest:application' }],
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
      'hotel-app': 'mf:host:app',
      'mf-guest-services-app': {
        projectType: 'mf:remote:app',
        options: {
          '@nx/angular:remote': { host: 'hotel-app' },
        },
      },
      'mf-room-maintenance-app': {
        projectType: 'mf:remote:app',
        options: {
          '@nx/angular:remote': { host: 'hotel-app' },
        },
      },
      'mf-event-management-app': {
        projectType: 'mf:remote:app',
        options: {
          '@nx/angular:remote': { host: 'hotel-app' },
        },
      },
      'hotel-api': 'backend:api',
      'admin-dashboard-app': 'global:angular:app',
    },
    libs: {
      guest: {
        'data-access': 'global:angular:lib:data-access',
        'guest-booking-feature': 'global:angular:lib:feature',
        'guest-feedback-feature': 'global:angular:lib:feature',
        ui: 'global:angular:lib:ui',
        utils: 'global:ts:lib:utils',
      },
      staff: {
        'data-access': 'global:angular:lib:data-access',
        'staff-feature': 'global:angular:lib:feature',
        'staff-scheduling-feature': 'global:angular:lib:feature',
        ui: 'global:angular:lib:ui',
        utils: 'global:ts:lib:utils',
      },
      room: {
        'data-access': 'global:angular:lib:data-access',
        'room-feature': 'global:angular:lib:feature',
        'room-request-feature': 'global:angular:lib:feature',
        ui: 'global:angular:lib:ui',
        utils: 'global:ts:lib:utils',
      },
      events: {
        'data-access': 'global:angular:lib:data-access',
        'event-booking-feature': 'global:angular:lib:feature',
        'event-management-feature': 'global:angular:lib:feature',
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
