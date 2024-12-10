export const isVerbose = () => process.env['NX_VERBOSE_LOGGING'] === 'true' || process.argv.includes('--verbose');
