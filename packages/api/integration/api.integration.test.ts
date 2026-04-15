import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';

describe('API Integration Test', () => {
  let sessionCookie: string = '';
  let memberSessionCookie: string = '';
  let activeOrganizationId: string = '';

  beforeAll(async () => {
    // Attempt to register a dummy owner user to use for authenticated requests
    try {
      const ts = Date.now();
      const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: API_URL,
        },
        body: JSON.stringify({
          email: `owner_${ts}@example.com`,
          password: 'password123',
          name: 'Test Owner User',
        }),
      });

      const setCookieHeader = res.headers.get('set-cookie');
      if (setCookieHeader) {
        sessionCookie = setCookieHeader.split(';')[0];
      }

      // Create an organization (this user becomes owner)
      const orgRes = await fetch(`${API_URL}/api/auth/organization/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
          Origin: API_URL,
        },
        body: JSON.stringify({
          name: `Test Org ${ts}`,
          slug: `test-org-${ts}`,
        }),
      });
      const orgJson = await orgRes.json();
      activeOrganizationId = orgJson.id;

      const activeOrgRes = await fetch(`${API_URL}/api/auth/organization/set-active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
          Origin: API_URL,
        },
        body: JSON.stringify({
          organizationId: activeOrganizationId,
        }),
      });

      const activeOrgCookieHeader = activeOrgRes.headers.get('set-cookie');
      if (activeOrgCookieHeader) {
        sessionCookie = `${sessionCookie}; ${activeOrgCookieHeader.split(';')[0]}`;
      }

      // Setup a member user
      const memberRes = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: API_URL,
        },
        body: JSON.stringify({
          email: `member_${ts}@example.com`,
          password: 'password123',
          name: 'Test Member User',
        }),
      });

      const memberSetCookieHeader = memberRes.headers.get('set-cookie');
      if (memberSetCookieHeader) {
        memberSessionCookie = memberSetCookieHeader.split(';')[0];
      }

      // Invite user to organization
      const inviteRes = await fetch(`${API_URL}/api/auth/organization/invite-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
          Origin: API_URL,
        },
        body: JSON.stringify({
          organizationId: activeOrganizationId,
          email: `member_${ts}@example.com`,
          role: 'member',
        }),
      });
      const inviteJson = await inviteRes.json();

      // Accept invitation
      const acceptRes = await fetch(`${API_URL}/api/auth/organization/accept-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: memberSessionCookie,
          Origin: API_URL,
        },
        body: JSON.stringify({
          invitationId: inviteJson.id,
        }),
      });

      const memberActiveOrgRes = await fetch(`${API_URL}/api/auth/organization/set-active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: memberSessionCookie,
          Origin: API_URL,
        },
        body: JSON.stringify({
          organizationId: activeOrganizationId,
        }),
      });
      const memberActiveOrgCookieHeader = memberActiveOrgRes.headers.get('set-cookie');
      if (memberActiveOrgCookieHeader) {
        memberSessionCookie = `${memberSessionCookie}; ${memberActiveOrgCookieHeader.split(';')[0]}`;
      }
    } catch (e) {
      console.error('Failed to setup test users and organization:', e);
    }
  });

  it('should return health check', async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  describe('Authentication and RBAC middleware', () => {
    it('should return 401 Unauthorized for missing authentication', async () => {
      const res = await fetch(`${API_URL}/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '{ __typename }' }),
      });
      expect(res.status).toBe(401);
    });

    it('should return 400 Bad Request for bad JSON syntax with valid authentication', async () => {
      const res = await fetch(`${API_URL}/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: 'invalid-json',
      });
      expect(res.status).toBe(400); // Bad Request from JSON parsing
      // Due to hono/graphql-server implementation, invalid JSON is caught by our onError handler if it's a SyntaxError, OR it might just return 400 with {"errors": [{}]} depending on where it's caught inside graphql-server. Both are 400.
    });

    it('should allow fetching trackers for authenticated owner with organization context', async () => {
      const res = await fetch(`${API_URL}/tracker`, {
        headers: {
          Cookie: sessionCookie,
        },
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.trackers).toBeInstanceOf(Array);
    });

    it('should allow fetching trackers for authenticated member with organization context', async () => {
      const res = await fetch(`${API_URL}/tracker`, {
        headers: {
          Cookie: memberSessionCookie,
        },
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.trackers).toBeInstanceOf(Array);
    });
  });

  describe('Tracker Router (/tracker)', () => {
    it('POST /generate should fail with invalid input format', async () => {
      const res = await fetch(`${API_URL}/tracker/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ origin: 'not-a-url' }),
      });
      expect(res.status).toBe(400);
    });

    it('POST /generate should fail for member role (403 Forbidden)', async () => {
      const res = await fetch(`${API_URL}/tracker/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: memberSessionCookie,
        },
        body: JSON.stringify({ origin: 'https://example.com' }),
      });
      expect(res.status).toBe(403);
    });

    it('DELETE /:id should fail for member role (403 Forbidden)', async () => {
      const res = await fetch(`${API_URL}/tracker/some-id`, {
        method: 'DELETE',
        headers: {
          Cookie: memberSessionCookie,
        },
      });
      expect(res.status).toBe(403);
    });

    it('POST /generate should succeed with valid input', async () => {
      const res = await fetch(`${API_URL}/tracker/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ origin: 'https://example.com' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.trackers).toBeInstanceOf(Array);
      expect(json.trackers.length).toBeGreaterThan(0);
      expect(json.trackers[0].origin).toBe('https://example.com');
    });

    it('DELETE /:id should delete an existing tracker', async () => {
      const generateRes = await fetch(`${API_URL}/tracker/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ origin: 'https://delete-me.com' }),
      });
      const genJson = await generateRes.json();
      const trackerId = genJson.trackers.find((t: any) => t.origin === 'https://delete-me.com').id;

      const deleteRes = await fetch(`${API_URL}/tracker/${trackerId}`, {
        method: 'DELETE',
        headers: {
          Cookie: sessionCookie,
        },
      });
      expect(deleteRes.status).toBe(200);

      const getRes = await fetch(`${API_URL}/tracker`, {
        headers: {
          Cookie: sessionCookie,
        },
      });
      const getJson = await getRes.json();
      expect(getJson.trackers.find((t: any) => t.id === trackerId)).toBeUndefined();
    });
  });

  describe('GraphQL API (/gql)', () => {
    it('should return GraphQL response for valid query', async () => {
      const res = await fetch(`${API_URL}/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
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
  });

  describe('GraphQL API endpoints', () => {
    it('should return null or article for "article" query', async () => {
      const res = await fetch(`${API_URL}/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          query: `
            query {
              article(url: "https://example.com/article1") {
                url
                title
                siteName
              }
            }
          `,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.article).toBeDefined();
    });

    it('should execute "rank" query with valid parameters', async () => {
      const res = await fetch(`${API_URL}/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          query: `
            query {
              rank(startDate: "2023-01-01T00:00:00Z", endDate: "2023-01-31T23:59:59Z") {
                total
                articles {
                  index
                  url
                  value
                }
              }
            }
          `,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.data?.rank?.total).toBeDefined();
      expect(json.data?.rank?.articles).toBeInstanceOf(Array);
    });

    it('should execute "trend" query with valid parameters', async () => {
      const res = await fetch(`${API_URL}/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          query: `
            query {
              trend(startDate: "2023-01-01T00:00:00Z", endDate: "2023-01-31T23:59:59Z", aggregation: { unit: DAY }) {
                total {
                  date
                  value
                }
              }
            }
          `,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.data?.trend?.total).toBeInstanceOf(Array);
    });

    it('should fail GraphQL validation for missing required arguments on "rank"', async () => {
      const res = await fetch(`${API_URL}/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
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
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.errors).toBeDefined();
    });
  });
});
