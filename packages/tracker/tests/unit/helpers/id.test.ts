import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getOrCreateVisitorId, getOrCreateVisitId } from '@/helpers/id';

describe('ID Helpers', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };

    vi.stubGlobal('localStorage', localStorageMock);

    // Mock crypto without random math to ensure stable different outputs for each call if needed.
    let counter = 0;
    const stableCryptoMock = { randomUUID: vi.fn(() => 'mocked-uuid-' + ++counter) };
    vi.stubGlobal('crypto', stableCryptoMock);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getOrCreateVisitorId', () => {
    test('should generate a new visitor ID if none exists', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

      const id = getOrCreateVisitorId();

      expect(id).toMatch(/^mocked-uuid-/);
      expect(localStorage.getItem('analytics_visitor_id')).toBe(id);
      expect(localStorage.getItem('analytics_visitor_date')).toBe('2024-01-01');
    });

    test('should return existing visitor ID on the same day', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const id1 = getOrCreateVisitorId();

      vi.setSystemTime(new Date('2024-01-01T23:59:59Z'));
      const id2 = getOrCreateVisitorId();

      expect(id1).toBe(id2);
      expect(localStorage.getItem('analytics_visitor_id')).toBe(id1);
      expect(localStorage.getItem('analytics_visitor_date')).toBe('2024-01-01');
    });

    test('should generate a new visitor ID on a different day', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const id1 = getOrCreateVisitorId();

      vi.setSystemTime(new Date('2024-01-02T00:00:01Z'));
      const id2 = getOrCreateVisitorId();

      expect(id1).not.toBe(id2);
      expect(localStorage.getItem('analytics_visitor_id')).toBe(id2);
      expect(localStorage.getItem('analytics_visitor_date')).toBe('2024-01-02');
    });
  });

  describe('getOrCreateVisitId', () => {
    test('should generate a new visit ID if none exists', () => {
      const now = new Date('2024-01-01T12:00:00Z').getTime();
      vi.setSystemTime(now);

      const id = getOrCreateVisitId();

      expect(id).toMatch(/^mocked-uuid-/);
      expect(localStorage.getItem('analytics_visit_id')).toBe(id);
      expect(localStorage.getItem('analytics_visit_last_ts')).toBe(now.toString());
    });

    test('should return existing visit ID and update timestamp if within timeout', () => {
      const time1 = new Date('2024-01-01T12:00:00Z').getTime();
      vi.setSystemTime(time1);
      const id1 = getOrCreateVisitId();

      // 15 minutes later
      const time2 = time1 + 15 * 60 * 1000;
      vi.setSystemTime(time2);
      const id2 = getOrCreateVisitId();

      expect(id1).toBe(id2);
      expect(localStorage.getItem('analytics_visit_id')).toBe(id1);
      expect(localStorage.getItem('analytics_visit_last_ts')).toBe(time2.toString());
    });

    test('should generate a new visit ID if timeout is exceeded', () => {
      const time1 = new Date('2024-01-01T12:00:00Z').getTime();
      vi.setSystemTime(time1);
      const id1 = getOrCreateVisitId();

      // 31 minutes later (default timeout is 30 mins)
      const time2 = time1 + 31 * 60 * 1000;
      vi.setSystemTime(time2);
      const id2 = getOrCreateVisitId();

      expect(id1).not.toBe(id2);
      expect(localStorage.getItem('analytics_visit_id')).toBe(id2);
      expect(localStorage.getItem('analytics_visit_last_ts')).toBe(time2.toString());
    });

    test('should respect custom timeout minutes', () => {
      const time1 = new Date('2024-01-01T12:00:00Z').getTime();
      vi.setSystemTime(time1);
      const id1 = getOrCreateVisitId({ visitTimeoutMinutes: 60 });

      // 45 minutes later
      const time2 = time1 + 45 * 60 * 1000;
      vi.setSystemTime(time2);
      const id2 = getOrCreateVisitId({ visitTimeoutMinutes: 60 });

      expect(id1).toBe(id2); // Still within custom 60 min timeout

      // 61 minutes later from time2 (the last visit time)
      const time3 = time2 + 61 * 60 * 1000;
      vi.setSystemTime(time3);
      const id3 = getOrCreateVisitId({ visitTimeoutMinutes: 60 });

      expect(id1).not.toBe(id3); // Exceeded custom 60 min timeout
    });
  });
});
