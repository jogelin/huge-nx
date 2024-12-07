import { startLocalRegistryAndRelease, stopLocalRegistry } from './local-registry.utils';

let teardownHappened = false;

export async function setup() {
  await startLocalRegistryAndRelease();
}

export async function teardown() {
  if (teardownHappened) {
    throw new Error('teardown called twice');
  }
  teardownHappened = true;

  stopLocalRegistry();
}
