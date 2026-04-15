import { getConnInfo } from '@hono/node-server/conninfo';
import fs from 'fs';
import { Context } from 'hono';
import maxmind, { type CityResponse, type Reader } from 'maxmind';
import { Geo, GeoProvider } from './index';

export default class MaxmindGeo implements GeoProvider {
  maxmindDbPath: string;
  maxmindReader: Reader<CityResponse> | undefined;

  constructor(maxmindDbPath?: string) {
    this.maxmindDbPath = maxmindDbPath || 'data/GeoLite2-City.mmdb';
  }

  async init() {
    const dbExists = fs.existsSync(this.maxmindDbPath);
    if (!dbExists) {
      console.warn(`Maxmind DB not found at ${this.maxmindDbPath}. Geo lookup will be disabled.`);
      return;
    }
    this.maxmindReader = await maxmind.open<CityResponse>(this.maxmindDbPath);
  }

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
      try {
        const info = getConnInfo(c);
        return info.remote.address;
      } catch (e) {
        // Fallback for test environment where getConnInfo fails
        return '127.0.0.1';
      }
    })();

    if (!this.maxmindReader || !ip) return geo;

    const maxmindInfo = this.maxmindReader.get(ip);
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
