import { execSync } from 'child_process';
import { isCI } from 'ci-info';
import { dirSync } from 'tmp';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { join } from 'node:path';
import { exists } from '@nx/plugin/testing';
import { mkdirSync } from 'node:fs';
import { IS_VERBOSE_REQUESTED, output } from '@huge-nx/devkit';

export function createHugeNxWorkspace(
  wsName: string,
  hugeNxConventions: string,
  { nxVersion, defaultBase, packageManager, workspaces }: { nxVersion?: string; defaultBase?: string; packageManager?: string; workspaces?: boolean } = {}
) {
  let command = `npx --yes create-huge-nx@${process.env.PUBLISHED_VERSION} ${wsName} --hugeNxConventions=${hugeNxConventions} --nxCloud=skip --no-interactive`;

  if (nxVersion) {
    command += ` --nxVersion=${nxVersion}`;
  }
  if (defaultBase) {
    command += ` --defaultBase=${defaultBase}`;
  }
  if (packageManager) {
    command += ` --packageManager=${packageManager}`;
  }
  if (workspaces) {
    command += ` --workspaces=${workspaces}`;
  }

  if (!exists(tmpE2eRoot)) {
    mkdirSync(tmpE2eRoot, { recursive: true });
  }

  // Have to specify inherit here because the command is run in a child process
  return runCommand(command, tmpE2eRoot, 'inherit');
}

// export const tmpE2eRoot = isCI ? dirSync({ prefix: 'huge-nx-e2e-' }).name : join(`${workspaceRoot}/tmp/huge-nx-e2e`);
export const tmpE2eRoot = isCI ? dirSync({ prefix: 'huge-nx-e2e-' }).name : join(`${workspaceRoot}/tmp/huge-nx-e2e`);

export const getWsName = (hugeNxConventions: string, nxVersion = 'latest') => {
  const wsName = hugeNxConventions.split('/')?.pop()?.replace('.conventions.ts', `-${nxVersion}`);
  return uniq(wsName);
};

export const getWsCwd = (wsName: string) => join(tmpE2eRoot, wsName);

export function uniq(prefix: string): string {
  const randomSevenDigitNumber = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  return `${prefix}-${randomSevenDigitNumber}`;
}

export function runCommand(command: string, cwd: string, stdio: 'inherit' | 'pipe' = 'pipe'): string {
  console.log(`Running command: ${command}`);
  let result = '';
  try {
    result = execSync(`${command}${IS_VERBOSE_REQUESTED ? ' --verbose' : ''}`, {
      cwd,
      stdio,
      env: {
        ...process.env,
        npm_config_registry: 'http://localhost:4873',
      },
      encoding: 'utf-8',
    });

    output.log({
      title: `Command: ${command}`,
      bodyLines: [result || 'No output'],
      color: 'green',
    });

    return result;
  } catch (e) {
    console.error(`[ERROR]: runCommand START -----------------------------`);
    console.error(command);
    console.error(result);
    console.error(e);
    console.error(`[ERROR]: runCommand END -----------------------------`);
    throw e;
  }
}
