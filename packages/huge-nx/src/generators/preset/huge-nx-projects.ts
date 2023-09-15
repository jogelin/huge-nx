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
  'first-angular-app': {
    generator: angularApplicationGenerator,
    getOptions: getAngularApplicationOptions,
  },
  'second-angular-app': {
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
  'first-feature': {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  'second-feature': {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
};

const teamAppLibs: HugeNxWorkspace = {
  shell: {
    generator: angularLibraryGenerator,
    getOptions: getAngularLibraryOptions,
  },
  'first-domain': domainLibs,
  'second-domain': domainLibs,
  shared: {
    'first-ui': {
      generator: angularLibraryGenerator,
      getOptions: getAngularLibraryOptions,
    },
    'first-util': {
      generator: angularLibraryGenerator,
      getOptions: getAngularLibraryOptions,
    },
  },
};

export const hugeNxWorkspace: HugeNxWorkspace = {
  apps: {
    'first-team': teamApps,
    'second-team': teamApps,
  },
  libs: {
    'first-team': {
      'first-angular-app': teamAppLibs,
      'second-angular-app': teamAppLibs,
    },
    'second-team': {
      'first-angular-app': teamAppLibs,
      'second-angular-app': teamAppLibs,
    },
  },
};
