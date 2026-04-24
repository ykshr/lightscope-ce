import processCategoryFilter from '@/graphql/loaders/helpers/categoryFilter';
import { describe, expect, it } from 'vitest';

describe('processCategoryFilter', () => {
  it('returns undefined if filter is empty', () => {
    expect(processCategoryFilter()).toBeUndefined();
  });

  it('correctly processes array filters', () => {
    const result = processCategoryFilter({ includeAges: ['18-24'] });
    expect(result).toBeDefined();
    expect(result?.query).toContain('age IN ({includeAges:Array(String)})');
    expect(result?.params).toEqual({ includeAges: ['18-24'] });
  });

  it('correctly processes filters with hash function required', () => {
    const result = processCategoryFilter({ includeDomains: ['example.com'] });
    expect(result).toBeDefined();
    expect(result?.query).toContain(
      'domain_hash IN (arrayMap(x -> cityHash64(x), {includeDomains:Array(String)}))'
    );
    expect(result?.params).toEqual({ includeDomains: ['example.com'] });
  });

  it('correctly combines multiple filters', () => {
    const result = processCategoryFilter({ includeAges: ['18-24'], excludeDevices: ['mobile'] });
    expect(result).toBeDefined();
    expect(result?.query).toContain('age IN ({includeAges:Array(String)})');
    expect(result?.query).toContain('device NOT IN ({excludeDevices:Array(String)})');
    expect(result?.query).toContain(' AND ');
    expect(result?.params).toEqual({ includeAges: ['18-24'], excludeDevices: ['mobile'] });
  });
});
