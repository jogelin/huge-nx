import { execSync } from 'node:child_process';
import { startLocalRegistryAndRelease, stopLocalRegistry } from './local-registry.utils';

let teardownHappened = false;

export async function setup() {
  await startLocalRegistryAndRelease();

  execSync('npm install -g create-huge-nx', { stdio: 'inherit' });
}

export async function teardown() {
  if (teardownHappened) {
    throw new Error('teardown called twice');
  }
  teardownHappened = true;

  stopLocalRegistry();
}
