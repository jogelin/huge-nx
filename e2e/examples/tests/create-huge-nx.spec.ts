import { existsSync, readFileSync, rmSync } from 'node:fs';
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

    const results = runCommand(`nx build my-app`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);
  });

  it('with conventions example name', async () => {
    const conventionsName = 'nx-preset-angular-monorepo';
    wsName = getWsName(conventionsName);
    wsCwd = getWsCwd(wsName);

    createHugeNxWorkspace(wsName, conventionsName);

    const results = runCommand(`nx build my-app`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);
  });

  it('with previous nx version', async () => {
    createHugeNxWorkspace(wsName, conventionsFile, { nxVersion: '19' });

    const results = runCommand(`nx build my-app`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);

    expect(readFileSync(`${wsCwd}/package.json`, { encoding: 'utf-8' })).toContain(`"nx": "19.`);
  });

  it('with native create-nx-workspace defaultBase parameter', async () => {
    createHugeNxWorkspace(wsName, conventionsFile, { defaultBase: 'develop' });

    const results = runCommand(`nx build my-app`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);

    expect(readFileSync(`${wsCwd}/nx.json`, { encoding: 'utf-8' })).toContain(`"defaultBase": "develop"`);
  });

  it('with native create-nx-workspace packageManager parameter', async () => {
    createHugeNxWorkspace(wsName, conventionsFile, { packageManager: 'pnpm' });

    const results = runCommand(`nx build my-app`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project my-app`);

    expect(existsSync(`${wsCwd}/pnpm-lock.yaml`)).toBe(true);
  });
});
