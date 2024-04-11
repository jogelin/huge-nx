import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { releasePublish, releaseVersion } from 'nx/release';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

// Related to the target generated in the root project.json
const localRegistryTarget = '@huge-nx/source:local-registry';

// Callback used to stop Verdaccio process
let stopLocalRegistry = () => {};

const hugeNxConventionsArgv = process.argv[2];
const workspaceName = hugeNxConventionsArgv.split('/')?.pop()?.replace('.conventions.ts', '');
if (!hugeNxConventionsArgv || !workspaceName) {
  throw new Error(
    'Provide the conventions file path like npx ts-node ./tools/scripts/publish-local.ts ./huge-nx/packages/conventions/src/examples/huge-angular-monorepo.conventions.ts'
  );
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

  const createCmd = `npm_config_registry=http://localhost:4873 npx create-huge-nx@latest ${workspaceName} --hugeNxConventions=${hugeNxConventionsArgv} --nxCloud skip --verbose`;
  console.log(createCmd);
  execSync(createCmd, {
    stdio: 'inherit',
  });

  stopLocalRegistry();

  process.exit(publishStatus);
})().catch((e) => {
  // If anything goes wrong, stop Verdaccio
  console.error(e);
  stopLocalRegistry();
  process.exit(1);
});
