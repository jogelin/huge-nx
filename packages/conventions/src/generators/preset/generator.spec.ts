import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration, workspaceRoot, readJson } from '@nx/devkit';

import { presetGenerator } from './generator';
import { PresetGeneratorSchema } from './schema';
import { join } from 'node:path';

import { addHandler } from 'nx/src/command-line/add/add';

describe('preset generator', () => {
  let tree: Tree;
  const options: PresetGeneratorSchema = {
    name: 'huge-test',
    hugeNxConventions: join(workspaceRoot, 'packages/conventions/src/examples/nx-preset-angular-monorepo.conventions.ts'),
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  xit('should generate angular-monorepo preset', async () => {
    await presetGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'my-app');
    expect(config).toBeDefined();
    expect(tree.exists('apps/my-app/jest.config.ts')).toBeTruthy();

    const configE2e = readProjectConfiguration(tree, 'my-app-e2e');
    expect(configE2e).toBeDefined();
    expect(tree.exists('apps/my-app-e2e/cypress.config.ts')).toBeTruthy();
  });
});
