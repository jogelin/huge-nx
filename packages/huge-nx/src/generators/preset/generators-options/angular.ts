import { Schema as AngularApplicationGeneratorSchema } from '@nx/angular/src/generators/application/schema';
import { join } from 'path';
import { Linter } from '@nx/linter';
import { E2eTestRunner } from '@nx/angular/src/utils/test-runners';
import { GetOptions } from './get-options.types';

export const getAngularOptions: GetOptions<
  AngularApplicationGeneratorSchema
> = (overrides) => ({
  directory: join('apps', overrides.name),
  inlineStyle: true,
  inlineTemplate: true,
  standalone: true,
  routing: true,
  style: 'scss',
  projectNameAndRootFormat: 'as-provided',
  linter: Linter.EsLint,
  e2eTestRunner: E2eTestRunner.Playwright,
  bundler: 'esbuild',
  ...overrides,
});
