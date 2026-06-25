export function splitCommaSeparated(str: string | undefined): string[] | undefined {
  if (!str) return undefined;
  return str.split(',').map((o) => o.trim());
}

export default function processAllowedOriginsString(allowedOrigins: string | undefined) {
  return splitCommaSeparated(allowedOrigins);
}
