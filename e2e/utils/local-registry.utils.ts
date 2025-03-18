import { STDIO_OUTPUT } from '@huge-nx/devkit';
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { releasePublish, releaseVersion } from 'nx/release';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { execSync } from 'node:child_process';

export async function startLocalRegistryAndRelease() {
  process.chdir(workspaceRoot);

  try {
    execSync('pkill -f verdaccio', { stdio: STDIO_OUTPUT });
  } catch (e) {
    console.info('No Verdaccio process to kill');
  }

  const localRegistryTarget = '@huge-nx/source:local-registry';
  const storage = './tmp/local-registry/storage';

  global.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
    clearStorage: true,
  });

  process.env.PUBLISHED_VERSION = `0.0.0-e2e.${Date.now()}`;

  await releaseVersion({
    specifier: process.env.PUBLISHED_VERSION,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    firstRelease: true,
    generatorOptionsOverrides: {
      skipLockFileUpdate: true,
    },
  });

  await releasePublish({
    tag: 'e2e',
    firstRelease: true,
  });
}

export function stopLocalRegistry() {
  if (global.stopLocalRegistry) {
    console.log('Stopping local registry');
    global.stopLocalRegistry();
  }
}
