import { rmSync } from 'node:fs';
import { createHugeNxWorkspace, getWsCwd, getWsName, runCommand, stripAnsi } from '@huge-nx/e2e-utils';

describe('create-huge-nx e2e', () => {
  const conventionsName = 'nx-preset-angular-monorepo';
  let wsName: string;
  let wsCwd: string;

  beforeEach(() => {
    wsName = getWsName(conventionsName);
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

  it('with conventions example name', async () => {
    createHugeNxWorkspace(wsName, conventionsName);

    const results = runCommand(`nx build my-app --skip-sync`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);
  });
});
