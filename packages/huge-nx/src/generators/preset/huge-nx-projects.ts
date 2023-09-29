import { Generator } from 'nx/src/config/misc-interfaces';
import {
  applicationGenerator as angularApplicationGenerator,
  libraryGenerator as angularLibraryGenerator,
} from '@nx/angular/generators';
import { GetOptions } from './generators-options/get-options.types';
import {
  getAngularApplicationOptions,
  getAngularLibraryOptions,
} from './generators-options/angular';
import { pluginGenerator } from '@nx/plugin/generators';
import { getPluginOptions } from './generators-options/plugin';

export interface NxProjectGenerator<T = unknown> {
  generator: Generator<T>;
  getOptions: GetOptions<T>;
}

export const instanceOfNxProjectGenerator = (
  obj: unknown
): obj is NxProjectGenerator => {
  return (
    !!(obj as NxProjectGenerator).generator &&
    !!(obj as NxProjectGenerator).getOptions
  );
};

export type HugeNxWorkspace = {
  [key: string]: HugeNxWorkspace | NxProjectGenerator;
};

const teamApps: HugeNxWorkspace = {
  'one-app': {
    generator: angularApplicationGenerator,
    getOptions: getAngularApplicationOptions,
  },
  'two-app': {
    generator: angularApplicationGenerator,
    getOptions: getAngularApplicationOptions,
  },
};

const domainLibs: HugeNxWorkspace = {
  api: {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  'data-access': {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  'list-feature': {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  'edit-feature': {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
};

const sharedLibs: HugeNxWorkspace = {
  ui: {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  util: {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  'nx-plugin': {
    generator: pluginGenerator,
    getOptions: getPluginOptions,
  },
};

const teamAppLibs: HugeNxWorkspace = {
  shell: {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  'foo-domain': domainLibs,
  'bar-domain': domainLibs,

  shared: sharedLibs,
};

export const hugeNxWorkspace: HugeNxWorkspace = {
  apps: {
    'first-team': teamApps,
    'second-team': teamApps,
  },
  libs: {
    'first-team': {
      'one-app': teamAppLibs,
      'two-app': teamAppLibs,
    },
    'second-team': {
      'one-app': teamAppLibs,
      'two-app': teamAppLibs,
    },
    shared: sharedLibs,
  },
};
