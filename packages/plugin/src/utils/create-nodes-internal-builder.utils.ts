import { dirname } from 'node:path';
import { CreateNodesContext, CreateNodesContextV2, CreateNodesResult } from 'nx/src/project-graph/plugins/public-api';
import { calculateHashForCreateNodes, ConfigCache } from './cache-config.utils';
import { isAttachedToProject } from './is-attached-to-project.util';
import { ProjectConfiguration } from '@nx/devkit';

export type GenerateConfig<T extends Record<string, string | number | boolean>> = (
  projectRoot: string,
  filePath: string,
  options: T,
  context: CreateNodesContextV2
) => Partial<ProjectConfiguration> | Promise<Partial<ProjectConfiguration>>;
export type WithProjectRoot<T> = (filePath: string, options: T, context: CreateNodesContextV2) => string;
export type SkipIf<T> = (projectRoot: string, filePath: string, options: T, context: CreateNodesContextV2) => boolean;
export type WithOptionsNormalizer<T> = (options: Partial<T>) => T;

export type CreateNodesInternal<T extends Record<string, string | number | boolean>> = readonly [
  projectFilePattern: string,
  createNodesInternal: CreateNodesInternalFunction<T>
];

export type CreateNodesInternalFunction<T> = (
  filePath: string,
  options: T,
  context: CreateNodesContext & { pluginName: string },
  configCache: ConfigCache
) => Promise<CreateNodesResult>;

export function createNodesInternalBuilder<T extends Record<string, string | number | boolean>>(projectFilePattern: string, generateConfig: GenerateConfig<T>) {
  let withOptionsNormalizer: WithOptionsNormalizer<T>;
  let withProjectRoot: WithProjectRoot<T>;
  const skipIf: SkipIf<T>[] = [];

  const builder = {
    withProjectRoot(fn: WithProjectRoot<T>) {
      withProjectRoot = fn;
      return builder;
    },
    withOptionsNormalizer(fn: WithOptionsNormalizer<T>) {
      withOptionsNormalizer = fn;
      return builder;
    },
    skipIf(fn: SkipIf<T>) {
      skipIf.push(fn);
      return builder;
    },
    build(): CreateNodesInternal<T> {
      return [
        projectFilePattern,
        async (filePath, options, context, configCache) => {
          // Normalize the options if a normalizer function is provided.
          options ??= {} as T;
          options = withOptionsNormalizer ? withOptionsNormalizer(options) : options;

          // Get project root from the file path. By default, take the directory of the file.
          const projectRoot = withProjectRoot ? withProjectRoot(filePath, options, context) : dirname(filePath);

          // Skip if one of the skipIf functions return true. By default, it should be linked to a project.json.
          const isNotAttachedToProject: SkipIf<T> = (projectRoot, filePath) => !filePath.includes('project.json') && !isAttachedToProject(projectRoot);
          const shouldSkip = [isNotAttachedToProject, ...skipIf].some((fn) => fn(projectRoot, filePath, options, context));
          if (shouldSkip) return {};

          // Compute hash based on the parameters and the pattern
          const nodeHash = await calculateHashForCreateNodes(projectRoot, options, context);
          const hash = `${nodeHash}_${projectFilePattern}`;

          // if config not yet in cache, generate it
          if (!configCache[hash]) {
            // logger.verbose(`Devkit ${context.pluginName}: Re-Compute Cache for ${filePath}`);

            // add by default a tag for the
            const pluginTag = `nx-plugin:${context.pluginName}`;
            const config = await generateConfig(projectRoot, filePath, options, context);

            configCache[hash] = {
              ...config,
              tags: [...(config?.tags ?? []), pluginTag],
            };
          }

          return {
            projects: {
              [projectRoot]: {
                root: projectRoot,
                ...configCache[hash],
              },
            },
          };
        },
      ];
    },
  };

  return builder;
}
