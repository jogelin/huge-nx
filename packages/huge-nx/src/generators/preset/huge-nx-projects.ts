import { Generator } from 'nx/src/config/misc-interfaces';
import { applicationGenerator as angularApplicationGenerator } from '@nx/angular/generators';
import { GetOptions } from './generators-options/get-options.types';
import { getAngularOptions } from './generators-options/angular';

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

export const hugeNxWorkspace: HugeNxWorkspace = {
  apps: {
    'team-one': {
      'app-one': {
        generator: angularApplicationGenerator,
        getOptions: getAngularOptions,
      },
      'app-two': {
        generator: angularApplicationGenerator,
        getOptions: getAngularOptions,
      },
    },
    'team-two': {
      'app-one': {
        generator: angularApplicationGenerator,
        getOptions: getAngularOptions,
      },
      'app-two': {
        generator: angularApplicationGenerator,
        getOptions: getAngularOptions,
      },
    },
  },
};
