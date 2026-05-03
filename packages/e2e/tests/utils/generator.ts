import { faker } from '@faker-js/faker';
import { UAParser } from 'ua-parser-js';

export type Payload = Record<string, any>;

export const generatePayload = (overrides: Partial<Payload> = {}): Payload => {
  const userAgent = overrides.user_agent || faker.internet.userAgent();
  const uaResult = new UAParser(userAgent).getResult();
  const url = overrides.url || faker.internet.url();
  const referrer = overrides.referrer || faker.internet.url();

  return {
    event_id: faker.string.uuid(),
    event_name: 'page_view',
    event_time: new Date().toISOString(),
    event_time_utc: new Date().toISOString(),
    url: url,
    title: faker.lorem.sentence(),
    site_name: faker.company.name(),
    locale: 'en-US',
    'og:title': faker.lorem.sentence(),
    'og:type': 'article',
    'og:image': faker.image.url(),
    'og:description': faker.lorem.paragraph(),
    'og:site_name': faker.company.name(),
    'og:locale': 'en_US',
    'article:published_time': faker.date.past().toISOString(),
    'article:modified_time': faker.date.recent().toISOString(),
    'article:expiration_time': faker.date.future().toISOString(),
    'article:authors': [faker.person.fullName(), faker.person.fullName()],
    'article:section': faker.commerce.department(),
    'article:tags': [faker.lorem.word(), faker.lorem.word()],
    user_id: faker.string.uuid(),
    visit_id: faker.string.uuid(),
    visitor_id: faker.string.uuid(),
    age: faker.helpers.arrayElement(['18-24', '25-34', '35-44']),
    gender: faker.helpers.arrayElement(['male', 'female', 'other']),
    referrer,
    user_agent: userAgent,
    language: 'en-US',
    device: uaResult.device.model || 'unknown',
    device_type: uaResult.device.type || 'desktop',
    device_vendor: uaResult.device.vendor || 'unknown',
    os: uaResult.os.name || 'unknown',
    os_version: uaResult.os.version || 'unknown',
    app: uaResult.browser.name || 'unknown',
    app_type: 'browser',
    app_version: uaResult.browser.version || 'unknown',
    ...overrides,
  };
};

export const generateMinimalPayload = (overrides: Partial<Payload> = {}): Payload => {
  return generatePayload(overrides);
};
