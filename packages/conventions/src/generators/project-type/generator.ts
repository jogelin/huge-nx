import { formatFiles, Tree } from '@nx/devkit';
import { ProjectTypeGeneratorSchema } from './schema';
import { GeneratorOptions, OptionsByGenerator } from '../../types/huge-nx-conventions';
import { output } from 'create-nx-workspace/src/utils/output';
import * as process from 'node:process';
import { installNxPlugin } from '../../utils/nx-plugins.util';
import { getPmc, objectToInlineArgs } from '@huge-nx/devkit';
import { execSync } from 'node:child_process';
import { hugeNxConventionsFileName, loadConventions } from '../../utils/load-conventions.util';
import { join } from 'node:path';
import { minimatch } from 'minimatch';

type ProjectTypeGeneratorExtraSchema = ProjectTypeGeneratorSchema & { extraOptionsByGenerator?: OptionsByGenerator };

async function runGenerator(generator: string, options: GeneratorOptions) {
  installNxPlugin(generator.split(':')[0]);

  const generatorCmd = `${getPmc().exec} nx g ${generator} ${objectToInlineArgs(options)}`;
  output.log({
    title: `Apply generator ${generator} on project ${options['name']}`,
    bodyLines: [generatorCmd],
  });
  execSync(generatorCmd, { stdio: 'inherit' });
}

function normalizeOptions(options: ProjectTypeGeneratorExtraSchema): ProjectTypeGeneratorExtraSchema {
  return { ...options };
}

export async function projectTypeGeneratorInternal(tree: Tree, options: ProjectTypeGeneratorExtraSchema) {
  const hugeNxConventionsDest = join(tree.root, hugeNxConventionsFileName);
  const hugeNxConventions = await loadConventions(hugeNxConventionsDest);

  const { name, projectType, directory, extraOptionsByGenerator } = normalizeOptions(options);

  if (!hugeNxConventions.projectTypes[projectType]) {
    output.error({
      title: `Project Type ${projectType} is not in your convention file`,
    });
    process.exit(1);
  }

  const projectTypeGenerators = hugeNxConventions.projectTypes[projectType].generators;
  const projectTypeNamePattern = hugeNxConventions.projectTypes[projectType].projectPattern;

  if (!minimatch(name, projectTypeNamePattern)) {
    output.error({
      title: `Project Name ${name} should match the Related Project Type Pattern ${projectTypeNamePattern}`,
    });
    process.exit(1);
  }

  const defaultGenerators = hugeNxConventions.generators;

  // execute all generators sequentially
  for (const { generator, options } of projectTypeGenerators) {
    const dir = `${directory}/${name}`;

    const generatorDefaultOptions = defaultGenerators?.[generator] ?? {};
    const projectTypeDefaultOptions = options ?? {};
    const directoryOptions = { name, directory: dir };
    const extraOptions = extraOptionsByGenerator?.[generator] ?? {};

    const allOptions = {
      ...generatorDefaultOptions,
      ...projectTypeDefaultOptions,
      ...extraOptions,
      ...directoryOptions,
    };

    await runGenerator(generator, allOptions);
  }

  await formatFiles(tree);
}

export async function projectTypeGenerator(tree: Tree, options: ProjectTypeGeneratorSchema) {
  await projectTypeGeneratorInternal(tree, options);
}

export default projectTypeGenerator;
