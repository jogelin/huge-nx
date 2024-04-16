import { execSync } from 'node:child_process';
import { output } from 'create-nx-workspace/src/utils/output';
import { PackageManagerCommands } from 'nx/src/utils/package-manager';

const installedPlugins: Map<string, boolean> = new Map();

export function installNxPlugin(nxPlugin: string, pmc: PackageManagerCommands) {
  if (!installedPlugins.has(nxPlugin)) {
    output.log({
      title: `Installing plugin needed to load conventions ${nxPlugin}`,
    });

    const cmd = `${pmc.exec} nx add ${nxPlugin} --no-interactive`;
    execSync(cmd, { stdio: 'inherit' });
    installedPlugins.set(nxPlugin, true);
  }
}
