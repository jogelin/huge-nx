import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { releasePublish, releaseVersion } from 'nx/release';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

// Related to the target generated in the root project.json
const localRegistryTarget = '@huge-nx/source:local-registry';

// Callback used to stop Verdaccio process
// eslint-disable-next-line @typescript-eslint/no-empty-function
let stopLocalRegistry = () => {};

const hugeNxConventionsArgv = process.argv[2];
const nxVersion = process.argv[3] ?? 'latest';
const workspaceName = hugeNxConventionsArgv.split('/')?.pop()?.replace('.conventions.ts', `-${nxVersion}`);
if (!hugeNxConventionsArgv || !workspaceName) {
  throw new Error('Provide the conventions name like npx ts-node ./tools/scripts/publish-local.ts huge-angular-monorep');
}

(async () => {
  try {
    execSync('pkill -f verdaccio', { stdio: 'inherit' });
  } catch (e) {
    console.info('No Verdaccio process to kill');
  }

  stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    verbose: false,
  });

  await releaseVersion({
    specifier: `0.0.0-local.${Date.now()}`,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    firstRelease: true,
    generatorOptionsOverrides: {
      skipLockFileUpdate: true,
    },
  });

  // The returned number value from releasePublish will be zero if all projects are published successfully, non-zero if not
  const publishStatus = await releasePublish({
    firstRelease: true,
  });

  process.chdir('..');

  rmSync(workspaceName, { force: true, recursive: true });

  const createCmd = `npx --yes create-huge-nx@latest ${workspaceName} --hugeNxConventions=${hugeNxConventionsArgv} --nxVersion ${nxVersion} --nxCloud skip --interactive false --verbose`;

  console.log(createCmd);

  execSync(createCmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_registry: 'http://localhost:4873',
      NX_DAEMON: 'false',
      NX_SKIP_NX_CACHE: 'false',
    },
  });

  stopLocalRegistry();

  const exitStatus = Object.values(publishStatus).reduce((acc, result) => result.code + acc, 0);
  process.exit(exitStatus);
})().catch((e) => {
  // If anything goes wrong, stop Verdaccio
  console.error(e);
  stopLocalRegistry();
  process.exit(1);
});
