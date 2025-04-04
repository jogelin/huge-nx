import { addDependenciesToPackageJson, formatFiles, Tree } from '@nx/devkit';
import { PresetGeneratorSchema } from './schema';
import { hugeNxConventionsFileName, loadConventions } from '../../utils/load-conventions.util';
import { HugeNxWorkspace, instanceOfHugeNxNodeWithExtraOptions } from '../../types/huge-nx-conventions';
import { join, resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { hugeNxVersion, output } from '@huge-nx/devkit';
import { projectTypeGeneratorInternal } from '../project-type/generator';

async function generateWorkspaceNodes(nxWorkspace: HugeNxWorkspace, tree: Tree, directory?: string): Promise<void> {
  for (const [nodeName, nodeValue] of Object.entries(nxWorkspace)) {
    const dir = directory ? `${directory}/${nodeName}` : nodeName;

    // if a parent folder, call recursively
    if (typeof nodeValue !== 'string' && !instanceOfHugeNxNodeWithExtraOptions(nodeValue)) {
      await generateWorkspaceNodes(nodeValue, tree, dir);
      continue;
    }
    const projectType = instanceOfHugeNxNodeWithExtraOptions(nodeValue) ? nodeValue.projectType : nodeValue;

    const nodeOptionsByGenerator = instanceOfHugeNxNodeWithExtraOptions(nodeValue) ? nodeValue.options : {};

    const name = dir.split('/').slice(1).join('-');

    output.log({
      title: `Generating ${name} in ${dir} with options ${JSON.stringify(nodeOptionsByGenerator)}`,
    });

    await projectTypeGeneratorInternal(tree, { name, directory: dir, projectType, extraOptionsByGenerator: nodeOptionsByGenerator });
  }
}

export async function presetGenerator(tree: Tree, options: PresetGeneratorSchema) {
  output.log({
    title: `Installing @huge-nx/conventions@${hugeNxVersion} in your monorepo`,
  });

  const installDeps = addDependenciesToPackageJson(tree, {}, { ['@huge-nx/conventions']: hugeNxVersion });
  await installDeps();

  const hugeNxConventionsSource = options.hugeNxConventions.endsWith('ts')
    ? resolve(tree.root, '..', options.hugeNxConventions)
    : resolve(tree.root, `./node_modules/@huge-nx/conventions/examples/${options.hugeNxConventions}.conventions.ts`);
  const hugeNxConventionsDest = join(tree.root, hugeNxConventionsFileName);

  output.log({
    title: `Copying conventions file ${options.hugeNxConventions} to ${hugeNxConventionsDest}`,
  });

  const conventionsFileStr = readFileSync(hugeNxConventionsSource, { encoding: 'utf8' });
  writeFileSync(hugeNxConventionsDest, conventionsFileStr, { encoding: 'utf8' });

  const hugeNxConventions = await loadConventions(hugeNxConventionsDest);

  output.log({
    title: `Applying conventions generators to you workspace`,
  });

  await generateWorkspaceNodes(hugeNxConventions.workspace, tree);

  await formatFiles(tree);
}

export default presetGenerator;
