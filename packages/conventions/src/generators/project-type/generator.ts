import { formatFiles, Tree } from '@nx/devkit';
import { ProjectTypeGeneratorSchema } from './schema';
import { GeneratorOptions, OptionsByGenerator } from '../../types/huge-nx-conventions';
import * as process from 'node:process';
import { installNxPlugin } from '../../utils/nx-plugins.util';
import { getPmc, objectToInlineArgs, output, STDIO_OUTPUT, workspaceNxVersion } from '@huge-nx/devkit';
import { execSync } from 'node:child_process';
import { hugeNxConventionsFileName, loadConventions } from '../../utils/load-conventions.util';
import { join } from 'node:path';
import { minimatch } from 'minimatch';
import { performance } from 'node:perf_hooks';

require('nx/src/utils/perf-logging');

type ProjectTypeGeneratorExtraSchema = ProjectTypeGeneratorSchema & { extraOptionsByGenerator?: OptionsByGenerator };

async function runGenerator(generator: string, options: GeneratorOptions) {
  const loadConventionsStart = performance.mark(`runGenerator:start:${generator}`);

  installNxPlugin(generator.split(':')[0]);

  const generatorCmd = `${getPmc().exec} nx g ${generator} ${objectToInlineArgs(options)}`;

  output.log({
    title: `Apply generator ${generator} on project ${options['name']}`,
    bodyLines: [generatorCmd],
  });

  execSync(generatorCmd, {
    stdio: STDIO_OUTPUT,
    env: {
      ...process.env,
    },
  });

  const loadConventionsEnd = performance.mark(`runGenerator:end:${generator}`);

  performance.measure('runGenerator', loadConventionsStart.name, loadConventionsEnd.name);
}

function normalizeOptions(options: ProjectTypeGeneratorExtraSchema): ProjectTypeGeneratorExtraSchema {
  return { ...options };
}

export async function projectTypeGeneratorInternal(tree: Tree, options: ProjectTypeGeneratorExtraSchema) {
  output.log({
    title: `Generate Project Type: ${options.projectType}`,
  });

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
  const projectTypeNamePattern = `**/${hugeNxConventions.projectTypes[projectType].projectPattern}`;

  if (!minimatch(name, projectTypeNamePattern)) {
    output.error({
      title: `Project Name ${name} should match the Related Project Type Pattern ${projectTypeNamePattern}`,
    });
    process.exit(1);
  }

  const defaultGenerators = hugeNxConventions.generators;

  // execute all generators sequentially
  for (const { generator, options } of projectTypeGenerators) {
    const generatorDefaultOptions = defaultGenerators?.[generator] ?? {};
    const projectTypeDefaultOptions = options ?? {};
    output.log({
      title: `NxVersion ${workspaceNxVersion()}`,
    });
    const directoryOptions = { name, directory, ...(workspaceNxVersion() < 20 ? { projectNameAndRootFormat: 'as-provided' } : {}) };
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
