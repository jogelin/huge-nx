import { Tree } from '@nx/devkit';
import { PresetGeneratorSchema } from './schema';
import {
  HugeNxWorkspace,
  hugeNxWorkspace,
  instanceOfNxProjectGenerator,
} from './huge-nx-projects';

async function generateNxProjects(
  nxWorkspace: HugeNxWorkspace,
  tree: Tree,
  directory?: string
) {
  for (const [key, value] of Object.entries(hugeNxWorkspace)) {
    // if a parent folder, call recursively
    if (!instanceOfNxProjectGenerator(value)) {
      await generateNxProjects(value, tree, `${directory}/${key}`);
      continue;
    }

    // if a generator
    const { generator, getOptions } = value;
    await generator(tree, getOptions({ name: key }));
  }
}

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  await generateNxProjects(hugeNxWorkspace, tree);
  // generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  // await formatFiles(tree);
}

export default presetGenerator;
