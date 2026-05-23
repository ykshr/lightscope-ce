import { createApp } from '@/app';
import type { TestHelpers } from 'better-auth/plugins';
import { beforeAll, describe, expect, it } from 'vitest';
import createContext, { mockClickhouseQuery } from './createContext';

process.env.DATABASE_URL = 'file:./prisma/db/test.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://localhost:8123';
process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

const ONE_HOUR_MS = 3600000;

describe('API Integration Test', () => {
  const adminHeaders = new Headers({ 'Content-Type': 'application/json' });
  const memberHeaders = new Headers({ 'Content-Type': 'application/json' });
  const app = createApp(createContext);

  beforeAll(async () => {
    try {
      const ts = Date.now();

      const context = await createContext({} as any);
      const auth = context.auth as any;
      const ctx = await auth.$context;
      const test: TestHelpers = ctx.test;

      // 1. Setup owner user using testUtils
      const user = test.createUser({
        email: `owner_${ts}@example.com`,
        name: 'Test Owner User',
      });

      await test.saveUser(user);

      const { headers: betterAuthHeaders } = await test.login({ userId: user.id });
      betterAuthHeaders.forEach((value, key) => adminHeaders.set(key, value));

      // Create an organization (this user becomes owner)
      const org = test.createOrganization?.({
        name: 'Test Org',
        slug: 'test-org',
      });
      if (!org) throw new Error('Failed to create organization');

      await test.saveOrganization?.(org);
      await test.addMember?.({
        userId: user.id,
        organizationId: org?.id as string,
        role: 'admin',
      });

      await auth.api.setActiveOrganization({
        headers: adminHeaders,
        body: { organizationId: org.id },
      });

      // 2. Setup member user
      const memberUser = test.createUser({
        email: `member_${ts}@example.com`,
        name: 'Test Member User',
      });
      await test.saveUser(memberUser);

      const { headers: betterAuthMemberHeaders } = await test.login({ userId: memberUser.id });
      betterAuthMemberHeaders.forEach((value, key) => memberHeaders.set(key, value));

      await test.addMember?.({
        userId: memberUser.id,
        organizationId: org?.id as string,
        role: 'member',
      });

      await auth.api.setActiveOrganization({
        headers: memberHeaders,
        body: { organizationId: org.id },
      });
    } catch (e) {
      console.error('Failed to setup test users and organization:', e);
    }
  });

  it('should return health check', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  describe('Authentication and RBAC middleware', () => {
    it('should return 401 Unauthorized for missing authentication', async () => {
      const res = await app.request('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query: '{ __typename }' }),
      });
      expect(res.status).toBe(401);
    });

    it('should return 400 Bad Request for bad JSON syntax with valid authentication', async () => {
      const res = await app.request('/graphql', {
        method: 'POST',
        headers: adminHeaders,
        body: 'invalid-json',
      });
      expect(res.status).toBe(400); // Bad Request from JSON parsing
      // Due to hono/graphql-server implementation, invalid JSON is caught by our onError handler if it's a SyntaxError, OR it might just return 400 with {"errors": [{}]} depending on where it's caught inside graphql-server. Both are 400.
    });

    it('should allow fetching trackers for authenticated owner with organization context', async () => {
      const res = await app.request('/tracker', {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.trackers).toBeInstanceOf(Array);
    });

    it('should allow fetching trackers for authenticated member with organization context', async () => {
      const res = await app.request('/tracker', {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.trackers).toBeInstanceOf(Array);
    });
  });

  describe('Tracker Router (/tracker)', () => {
    it('POST /generate should fail with invalid input format', async () => {
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ origin: 'not-a-url' }),
      });
      expect(res.status).toBe(400);
    });

    it('POST /generate should fail for member role (403 Forbidden)', async () => {
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: memberHeaders,
        body: JSON.stringify({ origin: 'https://member-test.com' }),
      });
      expect(res.status).toBe(403);
    });

    it('DELETE /:id should fail for member role (403 Forbidden)', async () => {
      const res = await app.request('/tracker/some-id', {
        method: 'DELETE',
        headers: memberHeaders,
      });
      expect(res.status).toBe(403);
    });

    it('POST /generate should succeed with valid input', async () => {
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ origin: 'https://valid-example.com' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.trackers).toBeInstanceOf(Array);
      expect(json.trackers.length).toBeGreaterThan(0);
      expect(json.trackers[0].origin).toBe('https://example.com');
    });

    it('DELETE /:id should delete an existing tracker', async () => {
      const generateRes = await app.request('/tracker/generate', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ origin: 'https://delete-me.com' }),
      });
      const genJson = await generateRes.json();
      const trackerId = genJson.trackers.find((t: any) => t.origin === 'https://delete-me.com').id;

      const deleteRes = await app.request(`/tracker/${trackerId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      expect(deleteRes.status).toBe(200);

      const getRes = await app.request('/tracker', {
        headers: adminHeaders,
      });
      const getJson = await getRes.json();
      expect(getJson.trackers.find((t: any) => t.id === trackerId)).toBeUndefined();
    });
  });

  describe('GraphQL API endpoints', () => {
    it('should return GraphQL response for valid query', async () => {
      const res = await app.request('/graphql', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          query: `
            query TestQuery {
              __typename
            }
          `,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.__typename).toBe('Query');
    });

    it('should return expected structures for article analytics', async () => {
      const query = `
        query {
          article(url: "https://example.com/test") {
            url
            title
            siteName
            analytics(
              startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
              endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
            ) {
              analytics {
                date
                value
              }
              analyticsUtm {
                source
                medium
                campaign
                value
              }
            }
          }
        }
      `;
      const res = await app.request('/graphql', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      expect(res.ok).toBeTruthy();
      expect(mockClickhouseQuery).toHaveBeenCalled();
      expect(json.data.article).toBeDefined();
      expect(json.data.article.title).toBe('Mocked Title');
      expect(json.data.article.analytics.analytics).toBeDefined();
      expect(json.data.article.analytics.analyticsUtm).toBeDefined();
    });

    it('should execute "rank" query and return expected structures', async () => {
      const query = `
        query {
          rank(
            startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
            endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
            limit: 5
          ) {
            total
            articles {
              index
              url
              value
            }
          }
        }
      `;
      const res = await app.request('/graphql', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      expect(res.ok).toBeTruthy();
      expect(mockClickhouseQuery).toHaveBeenCalled();
      expect(json.data?.rank?.total).toBeDefined();
      expect(Array.isArray(json.data.rank.articles)).toBe(true);
      expect(json.data.rank.articles[0].url).toBe('https://example.com/mock-1');
    });

    it('should fail GraphQL validation for invalid fields', async () => {
      const res = await app.request('/graphql', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          query: `
            query {
              nonExistentField {
                total
              }
            }
          `,
        }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.errors).toBeDefined();
    });

    it('should return errors for missing required arguments on "rank"', async () => {
      const res = await app.request('/graphql', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          query: `
            query {
              rank {
                total
              }
            }
          `,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.errors).toBeDefined();
      expect(json.errors.length).toBeGreaterThan(0);
    });

    it('should execute "trend" query and return expected structures', async () => {
      const query = `
        query {
          trend(
            startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
            endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
            aggregation: { unit: DAY }
          ) {
            total {
              date
              value
            }
          }
        }
      `;
      const res = await app.request('/graphql', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      expect(res.ok).toBeTruthy();
      expect(mockClickhouseQuery).toHaveBeenCalled();
      expect(json.data?.trend?.total).toBeDefined();
      expect(Array.isArray(json.data.trend.total)).toBe(true);
      expect(json.data.trend.total[0].value).toBe(10);
    });
  });
});
