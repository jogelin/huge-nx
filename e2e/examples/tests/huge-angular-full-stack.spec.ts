import { rmSync } from 'node:fs';
import { createHugeNxWorkspace, getWsCwd, getWsName, runCommand, stripAnsi } from '@huge-nx/e2e-utils';

describe('huge-angular-full-stack e2e', () => {
  const conventionsName = 'huge-angular-full-stack';
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

  it('should build successfully', async () => {
    createHugeNxWorkspace(wsName, conventionsName);

    const resultApp = runCommand(`nx build hotel-app`, wsCwd);
    expect(stripAnsi(resultApp)).toContain(`Successfully ran target build for project hotel-app`);

    const resultLib = runCommand(`nx build guest-data-access`, wsCwd);
    expect(stripAnsi(resultLib)).toContain(`Successfully ran target build for project guest-data-access`);
  });
});
