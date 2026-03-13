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
      const search = '?ptb=2023-01-01&mta=2023-02-01';
      const result = decodeUrlParams(search);
      expect(result.articleFilter?.publishedTimeBefore).toBeInstanceOf(Date);
      expect(result.articleFilter?.modifiedTimeAfter).toBeInstanceOf(Date);
      expect(result.articleFilter?.publishedTimeBefore?.getTime()).toBe(
        new Date('2023-01-01').getTime()
      );
      expect(result.articleFilter?.modifiedTimeAfter?.getTime()).toBe(
        new Date('2023-02-01').getTime()
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
      expect((result as any).unknown).toBeUndefined();
      expect(result.category).toBe('known');
    });
  });
});
