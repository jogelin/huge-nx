import { rmSync } from 'node:fs';
import { createHugeNxWorkspace, getWsCwd, getWsName, runCommand, stripAnsi } from '@huge-nx/e2e-utils';

const conventionsName = 'nx-preset-react-monorepo';

describe(`e2e: ${conventionsName}`, () => {
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
    }
  });

  it('should build successfully', async () => {
    createHugeNxWorkspace(wsName, conventionsName);

    const resultApp = runCommand(`nx build my-app --skip-sync`, wsCwd);
    expect(stripAnsi(resultApp)).toContain(`Successfully ran target build for project my-app`);
  });
});
