import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

export type Geo = {
  continent: string | undefined;
  country: string | undefined;
  subdivision: string | undefined;
  city: string | undefined;
};

export interface GeoProvider {
  getGeoData(c: Context): Promise<Geo>;
}

export default function createAuthMiddleware(geoProvider: GeoProvider) {
  return createMiddleware(async (c, next) => {
    c.set('geo', geoProvider);
    return await next();
  });
}
