import { Schema as AngularApplicationGeneratorSchema } from '@nx/angular/src/generators/application/schema';
import { Schema as AngularLibraryGeneratorSchema } from '@nx/angular/src/generators/library/schema';
import { Linter } from '@nx/linter';
import { GetOptions } from './get-options.types';

export const getAngularApplicationOptions: GetOptions<
  AngularApplicationGeneratorSchema
> = (overrides) => ({
  inlineStyle: true,
  inlineTemplate: true,
  standalone: true,
  routing: true,
  style: 'scss',
  projectNameAndRootFormat: 'as-provided',
  linter: Linter.EsLint,
  bundler: 'esbuild',
  ...overrides,
});

export const getAngularLibraryOptions: GetOptions<
  AngularLibraryGeneratorSchema
> = (overrides) => ({
  inlineStyle: true,
  inlineTemplate: true,
  standalone: true,
  changeDetection: 'OnPush',
  flat: true,
  style: 'scss',
  projectNameAndRootFormat: 'as-provided',
  linter: Linter.EsLint,
  ...overrides,
});
