import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { releasePublish, releaseVersion } from 'nx/release';

export async function startLocalRegistryAndRelease() {
  const localRegistryTarget = '@huge-nx/source:local-registry';
  const storage = './tmp/local-registry/storage';

  global.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
  });

  await releaseVersion({
    specifier: '0.0.0-e2e',
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
