import { execSync } from 'node:child_process';
import { output } from 'create-nx-workspace/src/utils/output';
import { getPmc } from '@huge-nx/devkit';

const installedPlugins: Map<string, boolean> = new Map();

export function installNxPlugin(nxPlugin: string) {
  if (!installedPlugins.has(nxPlugin)) {
    output.log({
      title: `Installing plugin needed to load conventions ${nxPlugin}`,
    });

    const cmd = `${getPmc().exec} nx add ${nxPlugin} --no-interactive`;
    execSync(cmd, { stdio: 'inherit' });
    installedPlugins.set(nxPlugin, true);
  }
}
