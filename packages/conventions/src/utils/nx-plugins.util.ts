import { execSync } from 'node:child_process';
import { getPmc, output, STDIO_OUTPUT } from '@huge-nx/devkit';

const installedPlugins: Map<string, boolean> = new Map();

export function installNxPlugin(nxPlugin: string) {
  if (!installedPlugins.has(nxPlugin)) {
    output.log({
      title: `Installing plugin needed to load conventions ${nxPlugin}`,
    });

    const cmd = `${getPmc().exec} nx add ${nxPlugin} --no-interactive`;
    execSync(cmd, { stdio: STDIO_OUTPUT });
    installedPlugins.set(nxPlugin, true);
  }
}
