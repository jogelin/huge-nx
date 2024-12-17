import { defineConventions } from '@huge-nx/conventions';

export default defineConventions({
  version: '1.0',
  generators: {
    '@nx/angular:application': {
      //<-- Generator Identifier
      linter: 'eslint', //<-- List of options
      style: 'css',
      unitTestRunner: 'jest',
      bundler: 'esbuild',
      e2eTestRunner: 'playwright',
      inlineStyle: true,
      inlineTemplate: true,
      ssr: false,
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
      //<-- Project Type Identifier
      projectPattern: '*-app', //<-- Pattern matching your naming convention
      generators: [{ generator: '@nx/angular:application' }], //<-- List of generators used to generate that type of project
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
    'global:angular:lib:ui:storybook': {
      //<-- This project type generates a library then a storybook configuration
      projectPattern: '*-ui',
      generators: [{ generator: '@nx/angular:library' }, { generator: '@nx/storybook:configuration', options: { uiFramework: '@storybook/angular' } }],
    },
    'global:ts:lib:utils': {
      projectPattern: '*-utils',
      generators: [{ generator: '@nx/js:lib', options: { bundler: 'swc' } }],
    },
  },
  workspace: {
    //<-- The workspace is structured by folders and projects
    apps: {
      //<-- Generates a folder apps
      'hotel-app': 'global:angular:app', //<-- Generates a project hotel-app by using the project type global:angular:app
      'hotel-api': {
        //<-- Generates a project hotel-api by using the project type backend:api and extra options
        projectType: 'backend:api',
        options: {
          '@nx/angular:remote': { frontendProject: 'hotel-app' },
        },
      },
    },
    libs: {
      //<-- Generates a folder libs
      guest: {
        //<-- Generates a folder guest
        'data-access': 'global:angular:lib:data-access', //<-- Generates a project guest-data-access by using the project type global:angular:lib:data-access
        'booking-feature': 'global:angular:lib:feature', //<-- Generates a project guest-booking-feature by using the project type global:angular:lib:feature
        'feedback-feature': 'global:angular:lib:feature', //<-- Generates a project guest-feedback-feature by using the project type global:angular:lib:feature
      },
      room: {
        //<-- Generates a folder room
        'data-access': 'global:angular:lib:data-access',
        'list-feature': 'global:angular:lib:feature',
        'request-feature': 'global:angular:lib:feature',
      },
      shared: {
        //<-- Generates a folder shared
        ui: {
          //<-- Generates a project shared-ui by using the project type global:angular:lib:ui:storybook and extra options
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
