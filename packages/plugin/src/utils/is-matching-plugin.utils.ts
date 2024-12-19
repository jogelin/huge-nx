import { CreateNodesV2 } from '@nx/devkit';
import { CreateNodesInternal } from './create-nodes-internal-builder.utils';
import { minimatch } from 'minimatch';

export function isMatchingPlugin<T extends Record<string, string | number | boolean>>(
  createNodes: CreateNodesV2<T> | CreateNodesInternal<T>,
  filePath: string
) {
  const pluginPattern = createNodes[0];
  return minimatch(filePath, pluginPattern);
}
