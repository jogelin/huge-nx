export type GeneratorOptions = Record<string, string | boolean | number>;

export type HugeNxNodeGenerator = {
  generator: string;
  options?: GeneratorOptions;
};

export type HugeNxNodeType = { projectPattern: string; generators: HugeNxNodeGenerator[] };

export type HugeNxProjectTypes = Record<string, HugeNxNodeType>;

export type OptionsByGenerator = { [generatorName: string]: GeneratorOptions };

export type HugeNxNodeWithExtraOptions = {
  projectType: keyof HugeNxProjectTypes;
  options: OptionsByGenerator;
};

export type HugeNxNode =
  // A node can refer directly to a project type key
  | keyof HugeNxProjectTypes
  // Or can extend a project type by adding extra options per generator
  | HugeNxNodeWithExtraOptions;

export type HugeNxWorkspace =
  | {
      [folderName: string]: HugeNxWorkspace;
    }
  | {
      [projectName: string]: HugeNxNode;
    };

export interface HugeNxConventions {
  /**
   * The version of the conventions file.
   */
  version: `${number}.${number}`;
  /**
   * This is nothing new and is **already available** in Nx by configuring your [`nx.json`](https://nx.dev/reference/nx-json#generators) file. You can define default options for each generator that you are using in your workspace.
   * All Nx options can be found in the [Nx API Documentation](https://nx.dev/nx-api).
   */
  generators: OptionsByGenerator;
  /**
   * Here you'll define your list of **ProjectType** based on the technologies, the domain, the type of library, the team, etc.
   * For each **ProjectType**, you'll specify which generators should be used and all conventions around them. It will use the **Default Generator Options**, and you can add extra options if needed.
   */
  projectTypes: HugeNxProjectTypes;
  /**
   * Finally, you'll define a seed that will look like your desired workspace. Each project will be linked and described by a specific **ProjectType**.
   * This seed can be used to generate a new workspace or a workspace that look that yours with the latest Nx version for example.
   */
  workspace: HugeNxWorkspace;
}

export const instanceOfHugeNxNodeWithExtraOptions = (obj: unknown): obj is HugeNxNodeWithExtraOptions => {
  return !!(obj as HugeNxNodeWithExtraOptions).projectType && !!(obj as HugeNxNodeWithExtraOptions).options;
};

export const instanceOfHugeNxWorkspace = (obj: unknown): obj is HugeNxWorkspace => {
  return obj instanceof Object;
};
