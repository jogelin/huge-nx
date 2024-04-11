import * as enquirer from 'enquirer';
import * as yargs from 'yargs';

import { CreateWorkspaceOptions, createWorkspace } from 'create-nx-workspace';
import { CLIErrorMessageConfig, output } from 'create-nx-workspace/src/utils/output';
import { printNxCloudSuccessMessage } from 'create-nx-workspace/src/utils/nx/nx-cloud';
import { determineDefaultBase, determineNxCloud, determinePackageManager } from 'create-nx-workspace/src/internal-utils/prompts';
import { withAllPrompts, withGitOptions, withNxCloud, withOptions, withPackageManager } from 'create-nx-workspace/src/internal-utils/yargs-options';
import { showNxWarning } from 'create-nx-workspace/src/utils/nx/show-nx-warning';
import { existsSync } from 'fs';
import * as chalk from 'chalk';

interface Arguments extends CreateWorkspaceOptions {
  hugeNxConventions: string;
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
          }),
        withNxCloud,
        withAllPrompts,
        withPackageManager,
        withGitOptions
      ),

    async function handler(argv: yargs.ArgumentsCamelCase<Arguments>) {
      await main(argv).catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { version } = require('../package.json');
        output.error({
          title: `Something went wrong! v${version}`,
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
  output.log({
    title: `Creating your Huge Nx workspace.`,
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  const workspaceInfo = await createWorkspace<Arguments>(`@huge-nx/conventions@${presetVersion}`, parsedArgs);

  showNxWarning(parsedArgs.name);

  if (parsedArgs.nxCloud && workspaceInfo.nxCloudInfo) {
    printNxCloudSuccessMessage(workspaceInfo.nxCloudInfo);
  }

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
    console.error(e);
    process.exit(1);
  }
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
