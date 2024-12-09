import { execSync } from 'child_process';
import { output } from 'create-nx-workspace/src/utils/output';
import { isCI } from 'ci-info';
import { dirSync } from 'tmp';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { join } from 'node:path';
import { exists } from '@nx/plugin/testing';
import { mkdirSync } from 'node:fs';
import { isVerbose } from '@huge-nx/devkit';

export function createHugeNxWorkspace(
  wsName: string,
  hugeNxConventions: string,
  { nxVersion, defaultBase, packageManager }: { nxVersion?: string; defaultBase?: string; packageManager?: string } = {}
) {
  let command = `npx --yes create-huge-nx@e2e ${wsName} --hugeNxConventions=${hugeNxConventions} --nxCloud=skip --no-interactive`;

  if (nxVersion) {
    command += ` --nxVersion=${nxVersion}`;
  }
  if (defaultBase) {
    command += ` --defaultBase=${defaultBase}`;
  }
  if (packageManager) {
    command += ` --packageManager=${packageManager}`;
  }

  if (!exists(tmpE2eRoot)) {
    mkdirSync(tmpE2eRoot, { recursive: true });
  }

  return runCommand(command, tmpE2eRoot);
}

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

export function runCommand(command: string, cwd: string): string {
  try {
    const result = execSync(`${command}${isVerbose() ? ' --verbose' : ''}`, {
      cwd,
      stdio: 'pipe',
      env: {
        ...process.env,
        CI: 'true',
        npm_config_registry: 'http://localhost:4873',
        NX_DAEMON: 'false',
        NX_SKIP_NX_CACHE: 'false',
        FORCE_COLOR: 'false',
      },
      encoding: 'utf-8',
    });

    if (isVerbose()) {
      output.log({
        title: `Command: ${command}`,
        bodyLines: [result],
        color: 'green',
      });
    }

    return result;
  } catch (e) {
    console.error(`Original command: ${command}`, `${e.stdout}\n\n${e.stderr}`);
    throw e;
  }
}
