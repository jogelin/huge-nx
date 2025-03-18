import { output as _output } from '@nx/devkit';
import { CLIOutput } from 'create-nx-workspace/src/utils/output';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const silentOutput: CLIOutput = Object.assign({}, _output, { writeToStdOut: () => {} });
export const IS_QUIET_REQUESTED = process.env['NX_GENERATE_QUIET'] === 'true';
export const IS_VERBOSE_REQUESTED = process.env['NX_VERBOSE_LOGGING'] === 'true';

export const isVerbose = () => IS_VERBOSE_REQUESTED || process.argv.includes('--verbose');

export const STDIO_OUTPUT: 'ignore' | 'inherit' | 'pipe' = IS_QUIET_REQUESTED && !isVerbose() ? 'ignore' : 'inherit';

export const output = (isVerbose() && !IS_QUIET_REQUESTED ? _output : silentOutput) as unknown as CLIOutput;
