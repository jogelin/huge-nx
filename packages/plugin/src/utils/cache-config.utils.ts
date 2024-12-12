import { ProjectConfiguration, readJsonFile, writeJsonFile } from '@nx/devkit';
import { existsSync } from 'node:fs';
import { CreateNodesContext, CreateNodesContextV2, hashArray } from 'nx/src/devkit-exports';

import { hashObject, hashWithWorkspaceContext } from 'nx/src/devkit-internals';
import { join } from 'path';

export type ConfigCache = Record<string, Partial<ProjectConfiguration>>;

export function readConfigCache(cachePath: string): ConfigCache {
  return existsSync(cachePath) ? readJsonFile(cachePath) : {};
}

export function writeConfigToCache(cachePath: string, results: ConfigCache) {
  writeJsonFile(cachePath, results);
}

export async function calculateHashForCreateNodes(
  projectRoot: string,
  options: object,
  context: CreateNodesContext | CreateNodesContextV2,
  rootGlob = '**/*',
  additionalGlobs: string[] = [],
  exclude: string[] = []
): Promise<string> {
  return hashArray([await hashWithWorkspaceContext(context.workspaceRoot, [join(projectRoot, rootGlob), ...additionalGlobs], exclude), hashObject(options)]);
}
