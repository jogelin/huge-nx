# Huge<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

[![CI](https://github.com/jogelin/huge-nx/actions/workflows/ci.yml/badge.svg)](https://github.com/jogelin/huge-nx/actions/workflows/ci.yml)

## Do you frequently create new Nx workspaces to check configs against yours?

**HugeNx** is a [custom preset](https://nx.dev/extending-nx/recipes/create-preset) used to dynamically generate a new [Nx workspace](https://nx.dev/) from your specific workspace conventions.

<!---
> TODO: More infos in my article:<br>[👥 Reproducible Nx Workspace with Dynamic huge-nx Preset]()
-->

## Getting Started

### 1. Define your HugeNx's conventions:

For example let's create a conventions file `angular-monorepo.conventions.ts` that match the default [Nx angular-monorepo preset](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial#creating-a-new-angular-monorepo):

```ts
export default {
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
};
```

### 2. Use [create-huge-nx](https://www.npmjs.com/package/create-huge-nx) client to generate a new Nx workspace from your HugeNx's conventions:

```bash
npx create-huge-nx@latest my-workspace --hugeNxConventions=./huge-nx.conventions.ts --nxCloud skip
```

This will generate a new workspace with the following structure:

```
my-workspace/
├── apps/
│   ├── my-app/
│   └── my-app-e2e/
├── nx.json
├── package.json
├── ...
└── huge-nx.conventions.ts
```

## HugeNx's Conventions

The idea behind the HugeNx's Conventions is to group into a single file, all informations needed to generate and maintain a complex Nx workspace that match your conventionnal decisions.

### Default Generator Options

The goal is to define global options related to a specific generator. Equivalent of your configurations in your [nx.json](https://nx.dev/reference/nx-json#generators).

For example:

```ts
export default {
  ...
  generators: {
    '@nx/angular:application': { //<-- Generator Identifier
      linter: 'eslint', //<-- List of options
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
  ...
};
```

All Nx options can be found on the [Nx API Documentation](https://nx.dev/nx-api).

### Project Types

When you delve into the documentation on structuring an Nx workspace today, you'll encounter extensive explanations on categorizing your library by scope or type and creating tags that establish your boundaries:

- [Code Organization & Naming Conventions](https://nx.dev/concepts/more-concepts/monorepo-nx-enterprise#code-organization-naming-conventions)
- [Library Types](https://nx.dev/concepts/more-concepts/library-types#library-types)
- [Domain Driven Design](https://github.com/angular-architects/nx-ddd-plugin/blob/main/libs/ddd/README.md)

This is really important to follow conventions especially for large project but it required some maintenance and can bring complexity.

For example:

```ts
export default {
  ...
  projectTypes: {
    'global:angular:app': { //<-- Project Type Identifier
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
    'global:angular:lib:ui:storybook': { //<-- This project type generates a library then a storybook configuration
      projectPattern: '*-ui',
      generators: [
        { generator: '@nx/angular:library' },
        { generator: '@nx/storybook:configuration', options: { uiFramework: '@storybook/angular' } }
      ],
    },
    'global:ts:lib:utils': {
      projectPattern: '*-utils',
      generators: [{ generator: '@nx/js:lib', options: { bundler: 'swc' } }],
    },
  },
  ...
};
```

### Workspace Structure

```ts
export default {
  ...
  workspace: { //<-- The workspace is structured by folders and projects
    apps: { //<-- Generates a folder apps
      'hotel-app': 'global:angular:app', //<-- Generates a project hotel-app by using the project type global:angular:app
      'hotel-api': {//<-- Generates a project hotel-api by using the project type backend:api and extra options
        projectType: 'backend:api',
        options: {
          '@nx/angular:remote': { frontendProject: 'hotel-app' },
        },
      },
    },
    libs: { //<-- Generates a folder libs
      guest: { //<-- Generates a folder guest
        'data-access': 'global:angular:lib:data-access', //<-- Generates a project guest-data-access by using the project type global:angular:lib:data-access
        'booking-feature': 'global:angular:lib:feature', //<-- Generates a project guest-booking-feature by using the project type global:angular:lib:feature
        'feedback-feature': 'global:angular:lib:feature', //<-- Generates a project guest-feedback-feature by using the project type global:angular:lib:feature
      },
      room: { //<-- Generates a folder room
        'data-access': 'global:angular:lib:data-access',
        'list-feature': 'global:angular:lib:feature',
        'request-feature': 'global:angular:lib:feature',
      },
      shared: { //<-- Generates a folder shared
        ui: {//<-- Generates a project shared-ui by using the project type global:angular:lib:ui:storybook and extra options
          projectType: 'global:angular:lib:ui:storybook',
          options: {
            '@nx/storybook:configuration': { project: 'shared-ui' },
          },
        },
        utils: 'global:ts:lib:utils',
      },
    },
  },
  ...
};
```

## Examples:

### Simple Presets
- **[Nx Angular Monorepo Preset](https://github.com/jogelin/huge-nx/blob/1303c113c93e7dc2888a2f89b36fc8e36ebc1073/packages/conventions/src/examples/nx-preset-angular-monorepo.conventions.ts)**

- **[Nx React Monorepo Preset](https://github.com/jogelin/huge-nx/blob/1303c113c93e7dc2888a2f89b36fc8e36ebc1073/packages/conventions/src/examples/nx-preset-react-monorepo.conventions.ts)**

### Advanced

- **[Huge Angular Monorepo](https://github.com/jogelin/huge-nx/blob/1303c113c93e7dc2888a2f89b36fc8e36ebc1073/packages/conventions/src/examples/huge-angular-monorepo.conventions.ts)**



## Open Doors:

### More Presets

It's now straightforward to create various types of repositories simply by introducing a new `huge-nx.conventions.ts` file. This approach not only encompasses all Nx presets, but also allows you to describe each type of project in detail, as outlined in the [library types section](https://nx.dev/concepts/more-concepts/library-types#library-types) of the Nx documentation.

For instance, you can define the types from the [`@angular-architects/ddd`](https://www.npmjs.com/package/@angular-architects/ddd) package and then use this definition to generate a workspace. This flexibility allows for a highly customized setup that caters to the specific needs of your project, leveraging Nx's powerful and extensible tooling ecosystem.

### [TODO] Generate `huge-nx.conventions.ts` file from AI

### [TODO] Allow Custom Generators

### [TODO] Linting rules to validate Workspace conventions

### [TODO] Crystal Plugin for Projects Discovery from Conventions file

### [TODO] ESlint Rules from Conventions file

### [TODO] Diff vizualization between two generations

## Local Development

### 1. Clone and install dependencies:

```bash
pnpm install
```

### 2. Build and Publish Libraries Locally

**HugeNx** provides a series of npm scripts that use predefined conventions to generate a new Nx Workspace. Here are some examples:

- **[Nx Angular Monorepo Preset](https://github.com/jogelin/huge-nx/blob/1303c113c93e7dc2888a2f89b36fc8e36ebc1073/packages/conventions/src/examples/nx-preset-angular-monorepo.conventions.ts):**

  ```bash
  pnpm run create:nx-preset-angular-monorepo
  ```

- **[Nx React Monorepo Preset](https://github.com/jogelin/huge-nx/blob/1303c113c93e7dc2888a2f89b36fc8e36ebc1073/packages/conventions/src/examples/nx-preset-react-monorepo.conventions.ts):**

  ```bash
  pnpm run create:nx-preset-react-monorepo
  ```

- **[Huge Angular Monorepo](https://github.com/jogelin/huge-nx/blob/1303c113c93e7dc2888a2f89b36fc8e36ebc1073/packages/conventions/src/examples/huge-angular-monorepo.conventions.ts):**
  ```bash
  pnpm run create:huge-angular-monorepo
  ```

These scripts use the `tools/publish-local.ts` script to start Verdaccio, build the libraries, publish them with a unique version, and create a new Nx Workspace based on the convention file name one level above.
