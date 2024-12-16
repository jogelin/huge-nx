import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry.js';
import { releasePublish, releaseVersion } from 'nx/release/index.js';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { exists } from '@nx/plugin/testing.js';

// Related to the target generated in the root project.json
const localRegistryTarget = '@huge-nx/source:local-registry';

const devTmpRepository = join(process.cwd(), 'tmp', 'huge-nx-dev');

if (!exists(devTmpRepository)) {
  mkdirSync(devTmpRepository, { recursive: true });
}

// Callback used to stop Verdaccio process
// eslint-disable-next-line @typescript-eslint/no-empty-function
let stopLocalRegistry = () => {};

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

  execSync(`npx create-huge-nx@latest`, {
    stdio: 'inherit',
    cwd: devTmpRepository,
    env: {
      ...process.env,
      npm_config_registry: 'http://localhost:4873',
      NX_DAEMON: 'false',
      NX_SKIP_NX_CACHE: 'false',
    },
  });

  // stopLocalRegistry();

  const exitStatus = Object.values(publishStatus).reduce((acc, result) => result.code + acc, 0);
  process.exit(exitStatus);
})().catch((e) => {
  // If anything goes wrong, stop Verdaccio
  console.error(e);
  stopLocalRegistry();
  process.exit(1);
});
