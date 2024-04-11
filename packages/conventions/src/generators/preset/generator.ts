import { addDependenciesToPackageJson, ensurePackage, formatFiles, installPackagesTask, Tree } from '@nx/devkit';
import { PresetGeneratorSchema } from './schema';
import { loadConventions } from '../../utils/load-conventions';
import { HugeNxConventions, HugeNxNodeGenerator, HugeNxWorkspace, instanceOfHugeNxNodeWithExtraOptions } from '../../types/huge-nx-conventions';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { addHandler } from 'nx/src/command-line/add/add';
import { logger } from '../../utils/logger';
import { nxVersion } from 'nx/src/utils/versions';
import { hugeNxVersion } from '../../utils/versions';

const hugeNxConventionsPath = 'huge-nx.conventions.ts';
const installedPlugins: Map<string, boolean> = new Map();

async function runGenerator(generator: string, options: Record<string, unknown>) {
  // Ensure generator plugin is installed
  const plugin = generator.split(':')[0];
  if (!installedPlugins.has(plugin)) {
    await addHandler({ packageSpecifier: plugin });
    installedPlugins.set(plugin, true);
  }

  // Convert Options to inline
  const inlineOptions = Object.entries(options)
    .map(([key, value]) => `--${key}=${value}`)
    .join(' ');

  const cmd = `npx nx g ${generator} ${inlineOptions} --no-interactive`;
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

      await runGenerator(generator, allOptions);
    }
  }
}

export async function presetGenerator(tree: Tree, options: PresetGeneratorSchema) {
  const installDeps = addDependenciesToPackageJson(tree, {}, { ['@huge-nx/conventions']: hugeNxVersion });
  await installDeps();

  const hugeNxConventionsSource = resolve(tree.root, '..', options.hugeNxConventions);
  const hugeNxConventionsDest = join(tree.root, hugeNxConventionsPath);

  logger.info(`Copy conventions file ${options.hugeNxConventions} to ${hugeNxConventionsDest}`);

  // Update file located at hugeNxConventionsDest with nx version
  const conventionsFileStr = readFileSync(hugeNxConventionsSource, { encoding: 'utf8' }).replace(
    /( +)version: '1.0',/,
    `$1version: '1.0',\n$1nxVersion: '${nxVersion}',`
  );

  writeFileSync(hugeNxConventionsDest, conventionsFileStr, { encoding: 'utf8' });

  const hugeNxConventions = await loadConventions(hugeNxConventionsDest);

  await generateWorkspaceNodes(hugeNxConventions.workspace, tree, hugeNxConventions);

  await formatFiles(tree);
}

export default presetGenerator;
