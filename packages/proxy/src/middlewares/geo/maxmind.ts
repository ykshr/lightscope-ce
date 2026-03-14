import fs from 'fs';
import maxmind, { type CityResponse } from 'maxmind';
import { Context } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import { MAXMIND_DB_PATH } from '@/helpers/env';
import { GeoProvider, Geo } from './index';

const dbExists = fs.existsSync(MAXMIND_DB_PATH);
const maxmindReader = dbExists ? await maxmind.open<CityResponse>(MAXMIND_DB_PATH) : null;

export default class MaxmindGeo implements GeoProvider {
  async getGeoData(c: Context) {
    const geo: Geo = {
      continent: undefined,
      country: undefined,
      subdivision: undefined,
      city: undefined,
    };

    const ip = (() => {
      const forwardedFor = c.req.header('x-forwarded-for');
      if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
      }
      const info = getConnInfo(c);
      return info.remote.address;
    })();

    if (!maxmindReader || !ip) return geo;

    const maxmindInfo = maxmindReader.get(ip);
    geo.continent = maxmindInfo?.continent?.code;
    geo.country = maxmindInfo?.country?.iso_code;
    geo.subdivision =
      maxmindInfo?.subdivisions && maxmindInfo.subdivisions.length > 0
        ? maxmindInfo.subdivisions[0].iso_code
        : undefined;
    geo.city = maxmindInfo?.city?.names?.en;

    return geo;
  }
}
