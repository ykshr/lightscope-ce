import { faker } from '@faker-js/faker';
import { UAParser } from 'ua-parser-js';

// Redefine Payload type to match packages/api/src/types/index.ts
// We duplicate this to keep e2e tests independent and avoid complex import paths
export interface Payload {
  event_id: string;
  event_time_utc: string; // ISO8601
  event_time: string; // ISO8601
  user_id?: string;
  visit_id: string;
  visitor_id: string;
  url: string;
  referrer?: string;
  'og:title'?: string;
  'og:type'?: string;
  'og:image'?: string;
  'og:url'?: string;
  'og:description'?: string;
  'og:site_name'?: string;
  'og:locale'?: string;
  'article:published_time'?: string;
  'article:modified_time'?: string;
  'article:expiration_time'?: string;
  'article:authors'?: string[];
  'article:section'?: string;
  'article:tags'?: string[];
  user_agent: string;
  device?: string;
  device_type?: string;
  device_vendor?: string;
  os?: string;
  os_version?: string;
  app?: string;
  app_type?: string;
  app_version?: string;
  age?: string;
  gender?: string;
  ip?: string;
  language?: string;
  engagement_time?: number;
}

export const generatePayload = (overrides: Partial<Payload> = {}): Payload => {
  const eventTime = faker.date.recent().toISOString();
  const userAgent = overrides.user_agent || faker.internet.userAgent();
  const uaParser = new UAParser(userAgent);
  const uaResult = uaParser.getResult();
  
  const defaultPayload: Payload = {
    event_id: faker.string.uuid(),
    event_time_utc: eventTime,
    event_time: eventTime,
    user_id: faker.string.uuid(),
    visit_id: faker.string.uuid(),
    visitor_id: faker.string.uuid(),
    url: faker.internet.url(),
    referrer: faker.internet.url(),
    'og:title': faker.lorem.sentence(),
    'og:type': 'article',
    'og:image': faker.image.url(),
    'og:url': faker.internet.url(),
    'og:description': faker.lorem.paragraph(),
    'og:site_name': faker.company.name(),
    'og:locale': faker.location.countryCode(),
    'article:published_time': faker.date.past().toISOString(),
    'article:modified_time': faker.date.recent().toISOString(),
    'article:expiration_time': faker.date.future().toISOString(),
    'article:authors': [faker.person.fullName(), faker.person.fullName()],
    'article:section': faker.commerce.department(),
    'article:tags': [faker.lorem.word(), faker.lorem.word()],
    user_agent: userAgent,
    device: uaResult.device.model || 'unknown',
    device_type: uaResult.device.type || 'desktop',
    device_vendor: uaResult.device.vendor || 'unknown',
    os: uaResult.os.name || 'unknown',
    os_version: uaResult.os.version || 'unknown',
    app: uaResult.browser.name || 'unknown',
    app_type: 'browser',
    app_version: uaResult.browser.version || 'unknown',
    age: faker.helpers.arrayElement(['18-24', '25-34', '35-44', '45-54', '55-64', '65+']),
    gender: faker.helpers.arrayElement(['male', 'female', 'other']),
    ip: faker.internet.ip(),
    language: faker.location.language().alpha2,
    engagement_time: faker.number.int({ min: 0, max: 300 }),
  };

  return { ...defaultPayload, ...overrides };
};

export const generateMinimalPayload = (overrides: Partial<Payload> = {}): Payload => {
  const eventTime = faker.date.recent().toISOString();
  const minimalPayload: Payload = {
    event_id: faker.string.uuid(),
    event_time_utc: eventTime,
    event_time: eventTime,
    visit_id: faker.string.uuid(),
    visitor_id: faker.string.uuid(),
    url: faker.internet.url(),
    user_agent: faker.internet.userAgent(),
  };
  
  return { ...minimalPayload, ...overrides };
}
