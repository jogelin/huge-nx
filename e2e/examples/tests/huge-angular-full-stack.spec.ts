import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { createHugeNxWorkspace, getWsCwd, getWsName, runCommand, stripAnsi } from '@huge-nx/e2e-utils';

describe('huge-angular-full-stack e2e', () => {
  const conventionsFile = join(workspaceRoot, 'examples', 'huge-angular-full-stack.conventions.ts');
  let wsName: string;
  let wsCwd: string;

  beforeEach(() => {
    wsName = getWsName(conventionsFile);
    wsCwd = getWsCwd(wsName);
  });

  afterEach(() => {
    rmSync(wsCwd, {
      recursive: true,
      force: true,
    });
  });

  it('should build successfully', async () => {
    const createWsOutput = createHugeNxWorkspace(wsName, conventionsFile);
    console.log(createWsOutput);
    const results = runCommand(`nx build hotel-app`, wsCwd);
    expect(stripAnsi(results)).toContain(`Successfully ran target build for project hotel-app`);
  });

  // test with file
  // test with example name
  // test wth nx previous nx version
  // test with native create nx workspace parameter
  // test with another package manager
});
