import * as ts from 'typescript';

import { readFileSync } from 'node:fs';
import { HugeNxConventions } from '../types/huge-nx-conventions';
import { output } from 'create-nx-workspace/src/utils/output';
import { installNxPlugin } from './nx-plugins';
import { PackageManagerCommands } from 'nx/src/utils/package-manager';

export async function loadConventions(hugeNxConventionsPath: string, pmc: PackageManagerCommands): Promise<HugeNxConventions> {
  output.log({
    title: `Loading conventions from ${hugeNxConventionsPath}`,
  });

  const sourceFile = ts.createSourceFile(hugeNxConventionsPath, readFileSync(hugeNxConventionsPath, { encoding: 'utf8' }), ts.ScriptTarget.Latest);

  const imports = parseTsImports(sourceFile);
  await installPackages(imports, pmc);

  const { outputText } = ts.transpileModule(sourceFile.text, {
    compilerOptions: { module: ts.ModuleKind.NodeNext },
  });
  return eval(outputText) as HugeNxConventions;
}

async function installPackages(imports: string[], pmc: PackageManagerCommands) {
  // TODO : should install the package with the correct version so we should read the package.json where the ts file is located
  // TODO : then that approach should be also used to read the tsconfig
  // const npmPackages = imports.filter((imp) => !imp.startsWith('.') && !imp.startsWith('huge-nx') && !imp.startsWith('@nx/'));
  // npmPackages.forEach((pkg) => ensurePackage(pkg, ''));

  const nxPlugins = imports.filter((imp) => imp.startsWith('@nx/'));

  for (const nxPlugin of nxPlugins) {
    installNxPlugin(nxPlugin, pmc);
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
