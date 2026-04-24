import processArticleFilter from '@/graphql/loaders/helpers/articleFilter';
import { describe, expect, it } from 'vitest';

describe('processArticleFilter', () => {
  it('returns undefined if filter is empty', () => {
    expect(processArticleFilter()).toBeUndefined();
  });

  it('correctly processes string array filters', () => {
    const result = processArticleFilter({ includeUrls: ['https://example.com'] });
    expect(result).toBeDefined();
    expect(result?.query).toContain('IN ({includeUrls:Array(String)})');
    expect(result?.params).toEqual({ includeUrls: ['https://example.com'] });
  });

  it('correctly processes text matches', () => {
    const result = processArticleFilter({ title: 'test title' });
    expect(result).toBeDefined();
    expect(result?.query).toContain('positionCaseInsensitiveUTF8(a.title, {title:String}) > 0');
    expect(result?.params).toEqual({ title: 'test title' });
  });

  it('correctly processes date fields', () => {
    const result = processArticleFilter({ publishedTimeBefore: '2023-01-01T00:00:00Z' });
    expect(result).toBeDefined();
    expect(result?.query).toContain('a.published_time < toDateTime({publishedTimeBefore:String})');
    expect(result?.params).toEqual({ publishedTimeBefore: '2023-01-01 00:00:00' });
  });

  it('correctly processes array of arrays (authors)', () => {
    const result = processArticleFilter({ includeAuthors: [['author1', 'author2']] });
    expect(result).toBeDefined();
    expect(result?.query).toContain('hasAny(a.authors, {includeAuthors_0:Array(String)})');
    expect(result?.params).toEqual({ includeAuthors_0: ['author1', 'author2'] });
  });
});
