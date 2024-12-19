import { combineCreateNodes, CreateNodesInternal, createNodesInternalBuilder, GenerateConfig, WithOptionsNormalizer } from '@huge-nx/plugin';
import { glob } from 'glob';
import { join } from 'node:path';
import { relative } from 'path';
import { normalizePath } from 'vite';
import { createNodesV2 as createNodesForVite, VitePluginOptions } from '@nx/vite/plugin';

export type PluginOptions = Record<string, string | number | boolean> &
  VitePluginOptions & {
    ciTestTargetName: string;
  };

const generateConfig: GenerateConfig<PluginOptions> = async (projectRoot, filePath, options, context) => {
  const [, createNodesResult] = (await createNodesForVite[1]([filePath], options, context))[0];
  const projectConfig = Object.values(createNodesResult.projects ?? {})[0];

  const groupName = 'E2E (CI)';

  if (options?.ciTestTargetName) {
    const testPaths = glob.sync(join(projectRoot, '**/*.spec.ts'));

    if (testPaths.length > 0) {
      const targetGroup = [];
      projectConfig.metadata = {
        ...projectConfig.metadata,
        targetGroups: {
          [groupName]: targetGroup,
        },
      };

      const dependsOn: string[] = [];
      projectConfig.targets[options.ciTestTargetName] = {
        executor: 'nx:noop',
        cache: true,
        inputs: [...projectConfig.targets[options.testTargetName].inputs, { env: 'CI' }],
        outputs: projectConfig.targets[options.testTargetName].outputs,
        dependsOn,
        metadata: {
          technologies: ['vite'],
          description: 'Run Vite tests',
          help: {
            command: 'pnpm exec vitest --help',
            example: {
              options: {
                bail: 1,
                coverage: true,
              },
            },
          },
        },
      };
      targetGroup.push(options.ciTestTargetName);

      for (const testPath of testPaths) {
        const relativePath = normalizePath(relative(join(context.workspaceRoot, projectRoot), testPath));
        const targetName = `${options.ciTestTargetName}--${relativePath}`;
        dependsOn.push(targetName);
        projectConfig.targets[targetName] = {
          cache: projectConfig.targets[options.testTargetName].cache,
          metadata: projectConfig.targets[options.testTargetName].metadata,
          outputs: projectConfig.targets[options.testTargetName].outputs,
          inputs: projectConfig.targets[options.ciTestTargetName].inputs,
          executor: 'nx:run-commands',
          options: {
            cwd: projectRoot,
            command: `vitest ${relativePath}`,
          },
        };
        targetGroup.push(targetName);
      }
    }
  }

  return projectConfig;
};

const normalizeOptions: WithOptionsNormalizer<PluginOptions> = (options) => ({
  testTargetName: (options.testTargetName ??= 'e2e'),
  ciTestTargetName: (options.ciTestTargetName ??= 'e2e-ci'),
});

const createNodesInternalForMain: CreateNodesInternal<PluginOptions> = createNodesInternalBuilder<PluginOptions>(`e2e/${createNodesForVite[0]}`, generateConfig)
  .withOptionsNormalizer(normalizeOptions)
  .build();

export const createNodesV2 = combineCreateNodes<PluginOptions>('e2e-atomizer', [createNodesInternalForMain]);
