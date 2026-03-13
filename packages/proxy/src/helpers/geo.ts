import fs from 'fs';
import maxmind, { type CityResponse } from 'maxmind';
import { type Context } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import { MAXMIND_DB_PATH } from '@/helpers/env';

const dbExists = fs.existsSync(MAXMIND_DB_PATH);
const maxmindReader = dbExists ? await maxmind.open<CityResponse>(MAXMIND_DB_PATH) : null;

export function getGeoData(c: Context) {
  const ip = (() => {
    const forwardedFor = c.req.header('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const info = getConnInfo(c);
    return info.remote.address;
  })();

  if (!maxmindReader || !ip) return undefined;
  const maxmindInfo = maxmindReader.get(ip);
  if (!maxmindInfo) return undefined;

  return {
    continent: maxmindInfo.continent?.code,
    country: maxmindInfo.country?.iso_code,
    subdivision:
      maxmindInfo.subdivisions && maxmindInfo.subdivisions.length > 0
        ? maxmindInfo.subdivisions[0].iso_code
        : undefined,
    city: maxmindInfo.city?.names?.en,
  };
}
