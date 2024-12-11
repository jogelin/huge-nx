import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { createHugeNxWorkspace, getWsCwd, getWsName, runCommand, stripAnsi } from '@huge-nx/e2e-utils';

describe('create-huge-nx e2e', () => {
  const conventionsFile = join(workspaceRoot, 'examples', 'nx-preset-angular-monorepo.conventions.ts');
  let wsName: string;
  let wsCwd: string;

  beforeEach(() => {
    wsName = getWsName(conventionsFile);
    wsCwd = getWsCwd(wsName);
  });

  afterEach((context) => {
    if (context.task.result.state === 'pass') {
      console.log(`Remove workspace ${wsCwd}`);
      rmSync(wsCwd, {
        recursive: true,
        force: true,
      });
    } else {
      console.log(`Test failed - Workspace content at ${wsCwd}:`);
      runCommand('ls -la', wsCwd);
    }
  });

  it('with conventions file path', async () => {
    createHugeNxWorkspace(wsName, conventionsFile);

    const results = runCommand(`nx build my-app --skip-sync`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);
  });
});
