import dotenv from 'dotenv';
import fs from 'fs';
import maxmind, { type CityResponse } from 'maxmind';

dotenv.config();

const MAXMIND_DB_PATH = process.env.MAXMIND_DB_PATH || 'data/GeoLite2-City.mmdb';
const dbExists = fs.existsSync(MAXMIND_DB_PATH);
const geo = dbExists ? await maxmind.open<CityResponse>(MAXMIND_DB_PATH) : null;
export { geo };
