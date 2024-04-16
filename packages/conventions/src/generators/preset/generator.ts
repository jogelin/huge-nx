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
import { logger } from '../../utils/logger';
import { hugeNxVersion, objectToInlineArgs } from '@huge-nx/devkit';
import { detectPackageManager, getPackageManagerCommand, PackageManagerCommands } from 'nx/src/utils/package-manager';

const hugeNxConventionsPath = 'huge-nx.conventions.ts';
const installedPlugins: Map<string, boolean> = new Map();

async function runGenerator(generator: string, options: GeneratorOptions, pmc: PackageManagerCommands) {
  // Ensure generator plugin is installed
  const plugin = generator.split(':')[0];
  if (!installedPlugins.has(plugin)) {
    const cmd = `${pmc.exec} nx add ${plugin} --no-interactive`;
    logger.info(cmd);
    execSync(cmd, { stdio: 'inherit' });
    installedPlugins.set(plugin, true);
  }

  const cmd = `${pmc.exec} nx g ${generator} ${objectToInlineArgs(options)} --no-interactive`;
  logger.info(cmd);
  execSync(cmd, { stdio: 'inherit' });
}

async function generateWorkspaceNodes(
  nxWorkspace: HugeNxWorkspace,
  tree: Tree,
  hugeNxConventions: HugeNxConventions,
  count = 0,
  directory?: string
): Promise<void> {
  const defaultGenerators = hugeNxConventions.generators;

  for (const [nodeName, nodeValue] of Object.entries(nxWorkspace)) {
    // if a parent folder, call recursively
    if (typeof nodeValue !== 'string' && !instanceOfHugeNxNodeWithExtraOptions(nodeValue)) {
      await generateWorkspaceNodes(nodeValue, tree, hugeNxConventions, count, directory ? `${directory}/${nodeName}` : nodeName);
      continue;
    }

    const projectType = instanceOfHugeNxNodeWithExtraOptions(nodeValue) ? nodeValue.projectType : nodeValue;
    const generators: HugeNxNodeGenerator[] = hugeNxConventions.projectTypes[projectType]?.generators;

    if (!generators) {
      throw new Error(`Cannot find nodeType generators associated to ${nodeValue} for ${nodeName}`);
    }

    const nodeOptionsByGenerator = instanceOfHugeNxNodeWithExtraOptions(nodeValue) ? nodeValue.options : {};

    const packageManager = detectPackageManager();
    const pmc = getPackageManagerCommand(packageManager);

    // execute all generators sequentially
    for (const { generator, options } of generators) {
      const dir = `${directory}/${nodeName}`;
      const name = dir.replace(/\//g, '-').split('-').slice(1).join('-');

      logger.info(`Generate project ${name} at ${dir}`);

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
  const installDeps = addDependenciesToPackageJson(tree, {}, { ['@huge-nx/conventions']: hugeNxVersion });
  await installDeps();

  const hugeNxConventionsSource = resolve(tree.root, '..', options.hugeNxConventions);
  const hugeNxConventionsDest = join(tree.root, hugeNxConventionsPath);

  logger.info(`Copy conventions file ${options.hugeNxConventions} to ${hugeNxConventionsDest}`);

  const conventionsFileStr = readFileSync(hugeNxConventionsSource, { encoding: 'utf8' });
  writeFileSync(hugeNxConventionsDest, conventionsFileStr, { encoding: 'utf8' });

  const hugeNxConventions = await loadConventions(hugeNxConventionsDest);

  await generateWorkspaceNodes(hugeNxConventions.workspace, tree, hugeNxConventions);

  await formatFiles(tree);
}

export default presetGenerator;
