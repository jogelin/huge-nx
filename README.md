# Huge<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

### Do you often generate a new Nx workspace from scratch to compare the configuration files with your existing workspace?

HugeNx is a [custom preset](https://nx.dev/extending-nx/recipes/create-preset) used to dynamically generate a new Nx workspace from a conventions file.

> TODO: More infos in my article:<br>[👥 Reproducible Nx Workspace with Dynamic huge-nx Preset]()

## Getting Started

**1. Create your `huge-nx.conventions.ts` file:**

For example let's create a conventions file that match the default [Nx angular-monorepo preset](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial#creating-a-new-angular-monorepo):

```typescript
import { defineConventions } from '@huge-nx/conventions';

export default defineConventions({
  version: '1.0',
  projectTypes: {
    'global:angular:application': {
      projectPattern: '*-app',
      generators: [{ generator: '@nx/angular:library' }],
    },
  },
  workspace: {
    apps: {
      'my-app': 'global:angular:application',
    },
  },
});
```

**2. Use `create-huge-nx` client to generate a new Nx workspace from your conventions file:**

```bash
npx create-huge-nx@latest my-workspace --hugeNxConventions=./huge-nx.conventions.ts --nxCloud skip
```

This will generate a new workspace with the following structure:
```
my-workspace/
├── apps/
│   ├── my-app/
│   └── my-app-e2e/
├── libs/
├── tools/
├── huge-nx.conventions.ts
└── nx.json
```

## Understanding the Conventions File

When you delve into the documentation on structuring an Nx workspace today, you'll encounter extensive explanations on categorizing your library by scope or type and creating tags that establish your boundaries:

- [Code Organization & Naming Conventions](https://nx.dev/concepts/more-concepts/monorepo-nx-enterprise#code-organization-naming-conventions)
- [Library Types](https://nx.dev/concepts/more-concepts/library-types#library-types)
- [Domain Driven Design](https://github.com/angular-architects/nx-ddd-plugin/blob/main/libs/ddd/README.md)

This is really important to follow conventions especially for large project but it required some maintenance and can bring complexity.

This is why I created that convention file that describe how you workspace is structured. I does not just allow code generation, it links each project to a specific type. This allows to attach rules and pattern to each project.

### Define Your Node Types
The first section of your convention file is to list the type of projects your are using in your repository.

### Define Your Workspace
[TODO]

### Using Custom Generators
[TODO]

### Execute multiple generators
[TODO]

## Philosophy

Create from scratch

## Examples:

### Default Nx Presets:

With the `huge-nx.conventions.ts` file, you can easely cover all default preset provided by Nx. This approach not only encompasses all Nx presets, but also allows you to describe each type of project in detail, as outlined in the [library types section](https://nx.dev/concepts/more-concepts/library-types#library-types) of the Nx documentation.

### Advanced Use Case:

  

  <details>
    <summary>📄 Show huge-angular-monorepo.conventions.ts</summary>

    ```typescript
    export default defineConventions({
      version: '1.0',
      projectTypes: {
        'global:angular:app': {
          projectPattern: '*-app',
          generators: [
            { generator: '@nx/angular:application', options: { bundler: 'esbuild', e2eTestRunner: 'playwright', inlineStyle: true, inlineTemplate: true } },
          ],
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
          'mf-guest-services-app': 'mf:remote:app',
          'mf-room-maintenance-app': 'mf:remote:app',
          'mf-event-management-app': 'mf:remote:app',
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
            ui: [
              { generator: '@nx/js:lib', options: { bundler: 'swc' } },
              { generator: '@nx/storybook:configuration', options: { project: 'shared-ui', uiFramework: '@storybook/angular' } },
            ],
            utils: 'global:ts:lib:utils',
          },
        },
      },
    });
    ```
  </details>


## Local Development

**1. Clone and install dependencies:**

```bash
pnpm install
```

**2. Build and Publish Libraries Locally**

HugeNx provides a series of npm scripts that use predefined conventions to generate a new Nx Workspace. Here are some examples:

- **[Nx Angular Monorepo Preset](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial#creating-a-new-angular-monorepo):**
  ```bash
  pnpm run create:nx-preset-angular-monorepo
  ```
  <details>
    <summary>📄 Show nx-preset-angular-monorepo.conventions.ts</summary>
  
    ```typescript
    export default defineConventions({
      version: '1.0',
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
    ```
  </details>


- **[Nx React Monorepo Preset](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial#creating-a-new-react-monorepo):**
  ```bash
  pnpm run create:nx-preset-react-monorepo
  ```
  <details>
    <summary>📄 Show nx-preset-react-monorepo.conventions.ts</summary>

    ```typescript 
      export default defineConventions({
        version: '1.0',
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
    ```
  </details>


- **Huge Angular Monorepo Preset:**
  ```bash
  pnpm run create:huge-angular-monorepo
  ```
  

These scripts use the tools/publish-local.ts script to start Verdaccio, build the libraries, publish them with a unique version, and create a new Nx Workspace based on the convention file name one level above.

## FAQ



## Open Doors:

### More Presets
It's now straightforward to create various types of repositories simply by introducing a new `huge-nx.conventions.ts` file. This approach not only encompasses all Nx presets, but also allows you to describe each type of project in detail, as outlined in the [library types section](https://nx.dev/concepts/more-concepts/library-types#library-types) of the Nx documentation.

For instance, you can define the types from the [`@angular-architects/ddd`](https://www.npmjs.com/package/@angular-architects/ddd) package and then use this definition to generate a workspace. This flexibility allows for a highly customized setup that caters to the specific needs of your project, leveraging Nx's powerful and extensible tooling ecosystem.

### Generate `huge-nx.conventions.ts` file from AI
[TODO]

### Generate `huge-nx.conventions.ts` file from existing Nx Workspace
[TODO]

### Diff between two generations
[TODO]

### Linting rules to validate that Nx workspace is following conventions
[TODO]

### Inferred Projects from Conventions file
[TODO]

### ESlint Rules from Conventions file
[TODO]
