import { createNodesFromFiles, CreateNodesV2 } from '@nx/devkit';
import { minimatch } from 'minimatch';
import { join } from 'node:path';
import { hashObject } from 'nx/src/hasher/file-hasher';
import { workspaceDataDirectory } from 'nx/src/utils/cache-directory';
import { combineGlobPatterns } from 'nx/src/utils/globs';
import { readConfigCache, writeConfigToCache } from './cache-config.utils';
import { CreateNodesInternal } from './create-nodes-internal-builder.utils';

export function combineCreateNodes<T extends Record<string, unknown>>(pluginName: string, createNodesInternals: CreateNodesInternal<T>[]): CreateNodesV2<T> {
  const projectFilePatterns = createNodesInternals.map(([globPattern]) => globPattern);

  return [
    combineGlobPatterns(projectFilePatterns),
    async (files, opt, context) => {
      const options = opt as T;
      const optionsHash = hashObject(options);
      const cachePath = join(workspaceDataDirectory, `${pluginName}-${optionsHash}.hash`);
      const configCache = readConfigCache(cachePath);
      try {
        return await createNodesFromFiles(
          (filePath, nestedOpt, context) => {
            const options = nestedOpt as T;

            const createNodesInternal = createNodesInternals.find(([globPattern]) => minimatch(filePath, globPattern, { dot: true }));

            if (!createNodesInternal) throw new Error(`No createNodesInternal found for ${filePath}`);

            const nestedCreateNodesInternal = createNodesInternal[1];
            return nestedCreateNodesInternal(filePath, options, { ...context, pluginName }, configCache);
          },
          files,
          options,
          context
        );
      } finally {
        writeConfigToCache(cachePath, configCache);
      }
    },
  ];
}
