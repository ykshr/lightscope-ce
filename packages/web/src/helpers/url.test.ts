import { describe, it, expect } from 'vitest';
import { encodeUrlParams, decodeUrlParams } from './url';

describe('url helpers', () => {
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

    it('should handle unknown config keys', () => {
      const params = { unknownKey: 'value' };
      const urlParams = encodeUrlParams(params as any, false);
      expect(urlParams.get('unknownKey')).toBe('value');
    });

    it('should encode date as string correctly', () => {
      const params = { startDate: '2023-01-01' };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.get('sd')).toBe('2023-01-01');
    });

    it('should encode number types correctly', () => {
      const params = { limit: 10 };
      const urlParams = encodeUrlParams(params, false);
      expect(urlParams.get('lm')).toBe('10');
    });

    it('should merge with existing window.location.search when isMerge is true', () => {
      // Mock window.location in JSDOM
      const originalLocation = window.location;

      // We will cast window to any to override location
      const win = window as any;
      win.location = {
        ...originalLocation,
        search: '?existing=true&cat=old',
      };

      const params = { category: 'new' };
      const urlParams = encodeUrlParams(params, true);

      expect(urlParams.get('existing')).toBe('true');
      expect(urlParams.get('cat')).toBe('new');

      win.location = originalLocation;
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
  });
});
