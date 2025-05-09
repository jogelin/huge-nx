import { existsSync, rmSync } from 'node:fs';
import { createHugeNxWorkspace, getWsCwd, getWsName, runCommand, stripAnsi } from '@huge-nx/e2e-utils';

const conventionsName = 'nx-preset-angular-monorepo';

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

  it('with native create-nx-workspace packageManager parameter', async () => {
    createHugeNxWorkspace(wsName, conventionsName, { packageManager: 'pnpm' });

    const results = runCommand(`nx build my-app --skip-sync`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);

    expect(existsSync(`${wsCwd}/pnpm-lock.yaml`)).toBe(true);
  });
});
