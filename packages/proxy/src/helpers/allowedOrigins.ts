export default function processAllowedOriginsString(allowedOrigins: string | undefined) {
  if (!allowedOrigins) return undefined;
  const origins = allowedOrigins.split(',').map((o) => o.trim());
  return origins;
}
