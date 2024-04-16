import * as enquirer from 'enquirer';
import * as yargs from 'yargs';

import type { CreateWorkspaceOptions } from 'create-nx-workspace';
import { CLIErrorMessageConfig, output } from 'create-nx-workspace/src/utils/output';
import { determineDefaultBase, determineNxCloud, determinePackageManager } from 'create-nx-workspace/src/internal-utils/prompts';
import { withAllPrompts, withGitOptions, withNxCloud, withOptions, withPackageManager } from 'create-nx-workspace/src/internal-utils/yargs-options';
import { showNxWarning } from 'create-nx-workspace/src/utils/nx/show-nx-warning';
import { existsSync } from 'node:fs';
import * as chalk from 'chalk';
import { execSync } from 'node:child_process';
import { hugeNxVersion } from '@huge-nx/devkit';

interface Arguments extends CreateWorkspaceOptions {
  hugeNxConventions: string;
  nxVersion: string;
}

export const commandsObject: yargs.Argv<Arguments> = yargs
  .wrap(yargs.terminalWidth())
  .parserConfiguration({
    'strip-dashed': true,
    'dot-notation': true,
  })
  .command<Arguments>(
    // this is the default and only command
    '$0 [name] [options]',
    'Create a new Nx workspace',
    (yargs) =>
      withOptions(
        yargs
          .option('name', {
            describe: chalk.dim`Workspace name (e.g. org name)`,
            type: 'string',
          })
          .option('hugeNxConventions', {
            describe: chalk.dim`Path to the Huge Nx Convention file (e.g. ./huge-nx.conventions.json)`,
            type: 'string',
          })
          .option('nxVersion', {
            describe: chalk.dim`Nx version to use in the new workspace`,
            default: 'latest',
            type: 'string',
          }),
        withNxCloud,
        withAllPrompts,
        withPackageManager,
        withGitOptions
      ),

    async function handler(argv: yargs.ArgumentsCamelCase<Arguments>) {
      await main(argv).catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        output.error({
          title: `Something went wrong! v${hugeNxVersion}`,
        });
        throw error;
      });
    },
    [normalizeArgsMiddleware as yargs.MiddlewareFunction<unknown>]
  )
  .help('help', chalk.dim`Show help`)
  .version(
    'version',
    chalk.dim`Show version`,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../package.json').version
  ) as yargs.Argv<Arguments>;

async function main(parsedArgs: yargs.Arguments<Arguments>) {
  const createNxWorkspaceCmd = `npx --yes create-nx-workspace@${parsedArgs.nxVersion} --preset "@huge-nx/conventions@${hugeNxVersion}" ${getInlineArgv(
    parsedArgs
  )} --no-interactive`;

  output.log({
    title: `Creating your Huge Nx workspace with Nx ${parsedArgs.nxVersion} and preset @huge-nx/conventions@${hugeNxVersion}`,
    bodyLines: [createNxWorkspaceCmd],
  });

  execSync(createNxWorkspaceCmd, { stdio: 'inherit' });
  showNxWarning(parsedArgs.name);

  output.log({
    title: `Successfully applied preset: ${parsedArgs.preset}`,
  });
}

async function normalizeArgsMiddleware(argv: yargs.Arguments<Arguments>): Promise<void> {
  output.log({
    title: "Let's create a new huge-nx workspace [https://nx.dev/getting-started/intro]",
  });

  try {
    const preset = '@huge-nx/conventions';
    const name = await determineFolder(argv);
    const hugeNxConventions = await determineConventions(argv);

    const packageManager = await determinePackageManager(argv);
    const defaultBase = await determineDefaultBase(argv);
    const nxCloud = await determineNxCloud(argv);

    Object.assign(argv, {
      name,
      preset,
      hugeNxConventions,
      nxCloud,
      packageManager,
      defaultBase,
    });
  } catch (e) {
    output.error({ title: `Cannot Normalize Arguments` });
    console.error(e);

    process.exit(1);
  }
}

function getInlineArgv(argv: yargs.Arguments<Arguments>): string {
  const createNxArgsKeys: (keyof Arguments)[] = [
    'name',
    'hugeNxConventions',
    'nxVersion',
    'packageManager',
    'defaultBase',
    'nxCloud',
    // 'interactive',
    // 'skipGit',
    // 'commit',
    // 'cliName',
  ];

  const filteredArgv = Object.keys(argv).reduce(
    (acc, key) => ({
      ...acc,
      ...(createNxArgsKeys.includes(key as keyof Arguments) && { [key]: argv[key] }),
    }),
    {}
  ) as Arguments;

  //tranform filteredArgv to inline arguments
  return Object.entries(filteredArgv).reduce((acc, [key, value]) => {
    if (typeof value === 'boolean') {
      return acc + (value ? ` --${key}` : '');
    }
    return acc + ` --${key}=${value}`;
  }, '');
}

function invariant<T = string | number | boolean>(predicate: T, message: CLIErrorMessageConfig): asserts predicate is NonNullable<T> {
  if (!predicate) {
    output.error(message);
    process.exit(1);
  }
}

async function determineFolder(parsedArgs: yargs.Arguments<Arguments>): Promise<string> {
  const folderName: string = parsedArgs._[0] ? parsedArgs._[0].toString() : parsedArgs.name;
  if (folderName) return folderName;

  const reply = await enquirer.prompt<{ folderName: string }>([
    {
      name: 'folderName',
      message: `Where would you like to create your workspace?`,
      initial: 'org',
      type: 'input',
    },
  ]);

  invariant(reply.folderName, {
    title: 'Invalid folder name',
    bodyLines: [`Folder name cannot be empty`],
  });

  invariant(!existsSync(reply.folderName), {
    title: 'That folder is already taken',
  });

  return reply.folderName;
}

async function determineConventions(parsedArgs: yargs.Arguments<Arguments>): Promise<string> {
  const hugeNxConventions =
    parsedArgs.hugeNxConventions ??
    (await enquirer
      .prompt<{ hugeNxConventions: string }>([
        {
          type: 'input',
          name: 'hugeNxConventions',
          message: `Where is located your huge-nx.conventions.json file?`,
          initial: './huge-nx.conventions.json',
        },
      ])
      .then((reply) => reply.hugeNxConventions));

  invariant(hugeNxConventions, {
    title: 'Invalid Path',
    bodyLines: [`Path cannot be empty`],
  });

  invariant(existsSync(hugeNxConventions), {
    title: `The huge-nx.conventions.json file cannot be found at ${hugeNxConventions}`,
  });

  return hugeNxConventions as string;
}
