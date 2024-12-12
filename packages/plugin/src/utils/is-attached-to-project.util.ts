import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { workspaceRoot } from 'nx/src/utils/workspace-root';

export function isAttachedToProject(projectRoot: string) {
  // Ensure we inject config on an existing project
  const siblingFiles = readdirSync(join(workspaceRoot, projectRoot));
  return siblingFiles.includes('project.json');
}
