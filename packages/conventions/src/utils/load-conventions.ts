import * as ts from 'typescript';

import { readFileSync } from 'node:fs';
import { HugeNxConventions } from '../types/huge-nx-conventions';
import { addHandler } from 'nx/src/command-line/add/add';
import { logger } from './logger';

export async function loadConventions(hugeNxConventionsPath: string): Promise<HugeNxConventions> {
  logger.info(`Loading conventions from ${hugeNxConventionsPath}`);

  const sourceFile = ts.createSourceFile(hugeNxConventionsPath, readFileSync(hugeNxConventionsPath, { encoding: 'utf8' }), ts.ScriptTarget.Latest);

  const imports = parseTsImports(sourceFile);
  await installPackages(imports);

  const { outputText } = ts.transpileModule(sourceFile.text, {
    compilerOptions: { module: ts.ModuleKind.NodeNext },
  });
  return eval(outputText) as HugeNxConventions;
}

async function installPackages(imports: string[]) {
  // TODO : should install the package with the correct version so we should read the package.json where the ts file is located
  // TODO : then that approach should be also used to read the tsconfig
  // const npmPackages = imports.filter((imp) => !imp.startsWith('.') && !imp.startsWith('huge-nx') && !imp.startsWith('@nx/'));
  // npmPackages.forEach((pkg) => ensurePackage(pkg, ''));

  const nxPlugins = imports.filter((imp) => imp.startsWith('@nx/'));
  for (const nxPlugin of nxPlugins) {
    console.log(`Add Nx Plugin ${nxPlugin}`);
    await addHandler({ packageSpecifier: nxPlugin });
  }
}

function parseTsImports(sourceFile: ts.SourceFile): string[] {
  const imports = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const importPath = node.moduleSpecifier.text;
      const packageName = extractPackageName(importPath);
      imports.push(packageName);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return imports;
}

function extractPackageName(importPath: string): string {
  // Handle scoped packages
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    // Scoped packages are expected to have at least two parts: @scope and package name
    if (parts.length >= 2) {
      return parts.slice(0, 2).join('/');
    }
  } else {
    // Handle non-scoped packages, including submodules
    const parts = importPath.split('/');
    return parts[0];
  }
  // Fallback to the original import path if the above conditions fail
  return importPath;
}