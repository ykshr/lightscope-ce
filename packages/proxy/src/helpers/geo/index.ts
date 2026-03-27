import { Context } from 'hono';

export type Geo = {
  continent: string | undefined;
  country: string | undefined;
  subdivision: string | undefined;
  city: string | undefined;
};

export interface GeoProvider {
  getGeoData(c: Context): Promise<Geo>;
}
