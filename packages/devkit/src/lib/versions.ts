import { workspaceRoot } from 'nx/src/utils/workspace-root';

export const hugeNxVersion = require('../../package.json').version;
export const workspaceNxVersion = (): number => {
  const packageJson = require(`${workspaceRoot}/package.json`);
  const nxVersion = packageJson.dependencies?.nx || packageJson.devDependencies?.nx;
  if (!nxVersion) {
    throw new Error('nx package not found in dependencies or devDependencies');
  }
  return parseInt(nxVersion.split('.')[0]);
};
