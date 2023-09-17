import { formatFiles, Tree } from '@nx/devkit';
import { PresetGeneratorSchema } from './schema';
import {
  HugeNxWorkspace,
  hugeNxWorkspace,
  instanceOfNxProjectGenerator,
} from './huge-nx-projects';

async function generateNxProjects(
  nxWorkspace: HugeNxWorkspace,
  tree: Tree,
  count = 0,
  directory?: string
): Promise<number> {
  let localCount = 0;
  for (const [key, value] of Object.entries(nxWorkspace)) {
    // if a parent folder, call recursively
    if (!instanceOfNxProjectGenerator(value)) {
      count = await generateNxProjects(
        value,
        tree,
        count,
        directory ? `${directory}/${key}` : key
      );
      continue;
    }

    // if a generator
    const { generator, getOptions } = value;

    const dir = `${directory}/${key}`;
    const name = dir.replace(/\//g, '-');
    console.log(`- Generate ${name} in ${name}`);
    await generator(
      tree,
      getOptions({
        name,
        directory: dir,
      })
    );
    localCount++;
  }
  return count + localCount;
}

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const count = await generateNxProjects(hugeNxWorkspace, tree);
  console.log(`- ${count} Generated`);
  // generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  // await formatFiles(tree);
}

export default presetGenerator;
