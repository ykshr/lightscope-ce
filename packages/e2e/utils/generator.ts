import { faker } from '@faker-js/faker';
import { UAParser } from 'ua-parser-js';
import {
  AnalyticsPayload,
  BrowsingAttributes,
  generateAnalyticsPayload,
  OGMetadata,
  UserAttributes,
} from '../../tracker/src/index';

// Export Payload as alias for AnalyticsPayload
export type Payload = AnalyticsPayload;

export const generatePayload = (overrides: Partial<AnalyticsPayload> = {}): AnalyticsPayload => {
  const userAgent = overrides.user_agent || faker.internet.userAgent();
  const uaResult = new UAParser(userAgent).getResult();
  const url = overrides.url || faker.internet.url();
  const referrer = overrides.referrer || faker.internet.url();

  const pageMetadata: OGMetadata = {
    url: url,
    'og:title': faker.lorem.sentence(),
    'og:type': 'article',
    'og:image': faker.image.url(),
    'og:description': faker.lorem.paragraph(),
    'og:site_name': faker.company.name(),
    'og:locale': faker.location.countryCode(),
    'article:published_time': faker.date.past().toISOString(),
    'article:modified_time': faker.date.recent().toISOString(),
    'article:expiration_time': faker.date.future().toISOString(),
    'article:authors': [faker.person.fullName(), faker.person.fullName()],
    'article:section': faker.commerce.department(),
    'article:tags': [faker.lorem.word(), faker.lorem.word()],
  };

  const userAttributes: UserAttributes = {
    user_id: faker.string.uuid(),
    age: faker.helpers.arrayElement(['18-24', '25-34', '35-44']),
    gender: faker.helpers.arrayElement(['male', 'female', 'other']),
  };

  const browsingAttributes: BrowsingAttributes = {
    referrer,
    user_agent: userAgent,
    language: faker.location.language().alpha2,
    device: uaResult.device.model || 'unknown',
    device_type: uaResult.device.type || 'desktop',
    device_vendor: uaResult.device.vendor || 'unknown',
    os: uaResult.os.name || 'unknown',
    os_version: uaResult.os.version || 'unknown',
    app: uaResult.browser.name || 'unknown',
    app_type: 'browser',
    app_version: uaResult.browser.version || 'unknown',
  };

  const payload = generateAnalyticsPayload({
    eventName: 'page_view',
    uaResult,
    visitId: faker.string.uuid(),
    visitorId: faker.string.uuid(),
    referrer,
    userAgent,
    language: browsingAttributes.language,
    lastEventTime: Date.now() - 10000,
    queryParams: {},
    userAttributes,
    browsingAttributes,
    pageMetadata,
    extraData: {},
  });

  return { ...payload, ...overrides };
};

export const generateMinimalPayload = (
  overrides: Partial<AnalyticsPayload> = {}
): AnalyticsPayload => {
  return generatePayload(overrides);
};
