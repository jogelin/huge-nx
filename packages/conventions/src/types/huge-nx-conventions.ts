export type HugeNxNodeGenerator = {
  generator: string;
  options?: Partial<object>;
};

export type HugeNxNodeType = { projectPattern: string; generators: HugeNxNodeGenerator[] };

export type HugeNxProjectTypes = Record<string, HugeNxNodeType>;

export type OptionsByGenerator = { [generatorName: string]: Partial<object> };

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
  version: `${number}.${number}`;
  generators: OptionsByGenerator;
  projectTypes: HugeNxProjectTypes;
  workspace: HugeNxWorkspace;
}

export const instanceOfHugeNxNodeWithExtraOptions = (obj: unknown): obj is HugeNxNodeWithExtraOptions => {
  return !!(obj as HugeNxNodeWithExtraOptions).projectType && !!(obj as HugeNxNodeWithExtraOptions).options;
};

export const instanceOfHugeNxWorkspace = (obj: unknown): obj is HugeNxWorkspace => {
  return obj instanceof Object;
};
