import { detectPackageManager, getPackageManagerCommand, PackageManagerCommands } from 'nx/src/utils/package-manager';

let pmc: PackageManagerCommands;

export function getPmc() {
  if (!pmc) {
    const packageManager = detectPackageManager();
    pmc = getPackageManagerCommand(packageManager);
  }
  return pmc;
}
