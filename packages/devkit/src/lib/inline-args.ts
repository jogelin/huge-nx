// convert object to inline args
export function objectToInlineArgs(obj: Record<string, string | boolean | number>): string {
  return Object.entries(obj)
    .map(([key, value]) => `--${key}=${value}`)
    .join(' ');
}
