import { Schema as PluginGeneratorSchema } from '@nx/plugin/src/generators/plugin/schema';

import { GetOptions } from './get-options.types';

export const getPluginOptions: GetOptions<PluginGeneratorSchema> = (
  overrides
) => ({
  projectNameAndRootFormat: 'as-provided',
  ...overrides,
});
