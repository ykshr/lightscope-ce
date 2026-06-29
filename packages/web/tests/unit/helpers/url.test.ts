import { describe, it, expect } from 'vitest';
import { encodeUrlParams, decodeUrlParams, PARAM_CONFIG } from '@/helpers/url';

describe('url helpers', () => {
  describe('PARAM_CONFIG', () => {
    it('should have unique short keys for all parameters', () => {
      const shortKeys = Object.values(PARAM_CONFIG).map((config) => config.short);
      const uniqueShortKeys = new Set(shortKeys);
      expect(shortKeys.length).toBe(uniqueShortKeys.size);
    });

    it('should configure date parameters correctly', () => {
      expect(PARAM_CONFIG.startDate).toEqual({ short: 'sd', type: 'date' });
      expect(PARAM_CONFIG.endDate).toEqual({ short: 'ed', type: 'date' });
    });

    it('should properly configure fields under articleFilter parent', () => {
      const articleFilterFields = Object.entries(PARAM_CONFIG).filter(
        ([, config]) => config.parent === 'articleFilter'
      );

      expect(articleFilterFields.length).toBeGreaterThan(0);

      // Verify a few specific ones
      const titleConfig = PARAM_CONFIG.title;
      expect(titleConfig).toEqual({ short: 'tt', type: 'string', parent: 'articleFilter' });

      const includeUrlsConfig = PARAM_CONFIG.includeUrls;
      expect(includeUrlsConfig).toEqual({ short: 'iu', type: 'array', parent: 'articleFilter' });
    });

    it('should configure array and nested array types correctly', () => {
      expect(PARAM_CONFIG.includeAges).toEqual({ short: 'iag', type: 'array' });
      expect(PARAM_CONFIG.includeAuthors).toEqual({
        short: 'ia',
        type: 'nestedArray',
        parent: 'articleFilter',
      });
    });

    it('should configure pagination and sorting correctly', () => {
      expect(PARAM_CONFIG.limit).toEqual({ short: 'lm', type: 'number' });
      expect(PARAM_CONFIG.page).toEqual({ short: 'pg', type: 'number' });
      expect(PARAM_CONFIG.order).toEqual({ short: 'ord', type: 'string' });
    });
  });

  describe('encodeUrlParams', () => {
    it('should encode string params', () => {
      const params = { category: 'test' };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.get('cat')).toBe('test');
    });

    it('should encode date params', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const params = { startDate: date };
      const urlParams = encodeUrlParams(params, false);
      // It uses formatDate which converts to UTC formatted string
      expect(urlParams.get('sd')).toContain('2023-01-01');
    });

    it('should encode date as string correctly', () => {
      const params = { startDate: '2023-01-01' };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.get('sd')).toBe('2023-01-01');
    });

    it('should encode array params', () => {
      const params = { includeUrls: ['a', 'b'] };
      const urlParams = encodeUrlParams(params, false);
      // URLSearchParams behavior with append: ?iu=a&iu=b
      expect(urlParams.getAll('iu')).toEqual(['a', 'b']);
    });

    it('should encode nested array params', () => {
      const params = { includeAuthors: [['john'], ['jane']] };
      const urlParams = encodeUrlParams(params, false);
      // config type is nestedArray
      // implementation: subArray.map(encodeURIComponent).join(',')
      // [['john'], ['jane']] -> iu=john & iu=jane
      const values = urlParams.getAll('ia');
      expect(values).toContain('john');
      expect(values).toContain('jane');
    });

    it('should handle complex nested arrays', () => {
      const params = { includeAuthors: [['a', 'b'], ['c']] };
      const urlParams = encodeUrlParams(params, false);
      // "a,b" and "c"
      const values = urlParams.getAll('ia');
      // code: subArray.map(encodeURIComponent).join(',') -> "a,b"
      // URLSearchParams stores the value. getAll returns it.
      expect(values).toContain('a,b');
      expect(values).toContain('c');
    });

    it('should remove null/undefined/empty values', () => {
      const params = { category: '' };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.has('cat')).toBe(false);
    });

    it('should handle string dates', () => {
      const params = { startDate: '2023-01-01' };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.get('sd')).toBe('2023-01-01');
    });

    it('should handle number types', () => {
      const params = { limit: 20 };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.get('lm')).toBe('20');
    });

    it('should handle unknown keys by falling back to string', () => {
      const params = { unknownKey: 'someValue' };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.get('unknownKey')).toBe('someValue');
    });

    it('should handle isMerge parameter true', () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { search: '?cat=old&other=value' },
        writable: true,
      });

      const params = { limit: 10, other: '' };
      const urlParams = encodeUrlParams(params, true);

      expect(urlParams.get('cat')).toBe('old');
      expect(urlParams.get('lm')).toBe('10');
      expect(urlParams.has('other')).toBe(false);

      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });
  });

  describe('decodeUrlParams', () => {
    it('should decode basic params', () => {
      const search = '?cat=test&lm=10';
      const result = decodeUrlParams(search);
      expect(result.category).toBe('test');
      expect(result.limit).toBe(10);
    });

    it('should decode array params', () => {
      const search = '?iu=a&iu=b';
      const result = decodeUrlParams(search);
      expect(result.articleFilter?.includeUrls).toEqual(['a', 'b']);
    });

    it('should decode array params at the root', () => {
      const search = '?iag=20-30&iag=30-40';
      const result = decodeUrlParams(search);
      expect(result.includeAges).toEqual(['20-30', '30-40']);
    });

    it('should decode nested array params', () => {
      const search = '?ia=a%2Cb&ia=c';
      const result = decodeUrlParams(search);
      // decodeURIComponent is called on value split by comma
      // value "a,b" -> split -> ["a", "b"]
      expect(result.articleFilter?.includeAuthors).toEqual([['a', 'b'], ['c']]);
    });

    it('should handle date params', () => {
      // Mock convertDateString for deterministic test if needed, or rely on implementation
      // decodeUrlParams uses convertDateString
      const search = '?sd=2023-01-01&ed=2023-12-31';
      const result = decodeUrlParams(search);
      // Assuming convertDateString turns string into a Date object or string based on logic
      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();
    });

    it('should handle date params', () => {
      const search = '?sd=2023-01-01&ed=2023-12-31&ptb=2023-02-01&mta=2023-02-02';
      const result = decodeUrlParams(search);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.articleFilter?.publishedTimeBefore).toBeInstanceOf(Date);
      expect(result.articleFilter?.modifiedTimeAfter).toBeInstanceOf(Date);
      expect(result.startDate?.getTime()).toBe(new Date('2023-01-01').getTime());
      expect(result.endDate?.getTime()).toBe(new Date('2023-12-31').getTime());
      expect(result.articleFilter?.publishedTimeBefore?.getTime()).toBe(
        new Date('2023-02-01').getTime()
      );
      expect(result.articleFilter?.modifiedTimeAfter?.getTime()).toBe(
        new Date('2023-02-02').getTime()
      );
    });

    it('should decode number params', () => {
      const search = '?lm=20&pg=2';
      const result = decodeUrlParams(search);
      expect(result.limit).toBe(20);
      expect(result.page).toBe(2);
    });

    it('should handle unrecognized params gracefully', () => {
      const search = '?unknown=val&cat=known';
      const result = decodeUrlParams(search);
      expect((result as Record<string, unknown>).unknown).toBeUndefined();
      expect(result.category).toBe('known');
    });
  });
});
