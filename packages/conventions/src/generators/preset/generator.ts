import { addDependenciesToPackageJson, formatFiles, Tree } from '@nx/devkit';
import { PresetGeneratorSchema } from './schema';
import { loadConventions } from '../../utils/load-conventions';
import {
  GeneratorOptions,
  HugeNxConventions,
  HugeNxNodeGenerator,
  HugeNxWorkspace,
  instanceOfHugeNxNodeWithExtraOptions,
} from '../../types/huge-nx-conventions';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { hugeNxVersion, objectToInlineArgs } from '@huge-nx/devkit';
import { detectPackageManager, getPackageManagerCommand, PackageManagerCommands } from 'nx/src/utils/package-manager';
import { installNxPlugin } from '../../utils/nx-plugins';
import { output } from 'create-nx-workspace/src/utils/output';
import * as process from 'node:process';

const hugeNxConventionsPath = 'huge-nx.conventions.ts';

async function runGenerator(generator: string, options: GeneratorOptions, pmc: PackageManagerCommands) {
  installNxPlugin(generator.split(':')[0], pmc);

  const generatorCmd = `${pmc.exec} nx g ${generator} ${objectToInlineArgs(options)} --no-interactive`;
  output.log({
    title: `Apply generator ${generator} on project ${options.name}`,
    bodyLines: [generatorCmd],
  });
  execSync(generatorCmd, { stdio: 'inherit' });
}

async function generateWorkspaceNodes(
  nxWorkspace: HugeNxWorkspace,
  tree: Tree,
  hugeNxConventions: HugeNxConventions,
  pmc: PackageManagerCommands,
  directory?: string
): Promise<void> {
  const defaultGenerators = hugeNxConventions.generators;

  for (const [nodeName, nodeValue] of Object.entries(nxWorkspace)) {
    // if a parent folder, call recursively
    if (typeof nodeValue !== 'string' && !instanceOfHugeNxNodeWithExtraOptions(nodeValue)) {
      await generateWorkspaceNodes(nodeValue, tree, hugeNxConventions, pmc, directory ? `${directory}/${nodeName}` : nodeName);
      continue;
    }

    const projectType = instanceOfHugeNxNodeWithExtraOptions(nodeValue) ? nodeValue.projectType : nodeValue;
    const generators: HugeNxNodeGenerator[] = hugeNxConventions.projectTypes[projectType]?.generators;

    if (!generators) {
      output.error({
        title: `Cannot find nodeType generators associated to ${nodeValue} for ${nodeName}`,
      });

      process.exit(1);
    }

    const nodeOptionsByGenerator = instanceOfHugeNxNodeWithExtraOptions(nodeValue) ? nodeValue.options : {};

    // execute all generators sequentially
    for (const { generator, options } of generators) {
      const dir = `${directory}/${nodeName}`;
      const name = dir.replace(/\//g, '-').split('-').slice(1).join('-');

      const generatorDefaultOptions = defaultGenerators[generator] ?? {};
      const projectTypeDefaultOptions = options ?? {};
      const nodeDefaultOptions = nodeOptionsByGenerator[generator] ?? {};
      const directoryOptions = { name, directory: dir, projectNameAndRootFormat: 'as-provided' };

      const allOptions = {
        ...generatorDefaultOptions,
        ...projectTypeDefaultOptions,
        ...nodeDefaultOptions,
        ...directoryOptions,
      };

      await runGenerator(generator, allOptions, pmc);
    }
  }
}

export async function presetGenerator(tree: Tree, options: PresetGeneratorSchema) {
  const packageManager = detectPackageManager();
  const pmc = getPackageManagerCommand(packageManager);

  output.log({
    title: `Installing @huge-nx/conventions@${hugeNxVersion} in your monorepo`,
  });

  const installDeps = addDependenciesToPackageJson(tree, {}, { ['@huge-nx/conventions']: hugeNxVersion });
  await installDeps();

  const hugeNxConventionsSource = resolve(tree.root, '..', options.hugeNxConventions);
  const hugeNxConventionsDest = join(tree.root, hugeNxConventionsPath);

  output.log({
    title: `Copying conventions file ${options.hugeNxConventions} to ${hugeNxConventionsDest}`,
  });

  const conventionsFileStr = readFileSync(hugeNxConventionsSource, { encoding: 'utf8' });
  writeFileSync(hugeNxConventionsDest, conventionsFileStr, { encoding: 'utf8' });

  const hugeNxConventions = await loadConventions(hugeNxConventionsDest, pmc);

  output.log({
    title: `Applying conventions generators to you workspace`,
  });

  await generateWorkspaceNodes(hugeNxConventions.workspace, tree, hugeNxConventions, pmc);

  await formatFiles(tree);
}

export default presetGenerator;
