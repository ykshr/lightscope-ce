import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('SQL Schema Validation', () => {
  it('should have correct engines for pv tables', () => {
    const pvRaw = fs.readFileSync(path.join(__dirname, '../../sql/pv/00_pv_raw.sql'), 'utf-8');
    expect(pvRaw).toMatch(/ENGINE = Null/i);

    const pvMin = fs.readFileSync(path.join(__dirname, '../../sql/pv/01_pv_min.sql'), 'utf-8');
    expect(pvMin).toMatch(/ENGINE = AggregatingMergeTree/i);
    expect(pvMin).toMatch(/ORDER BY \(organization_id_hash, date, site_name, url_hash\)/i);

    const pvHour = fs.readFileSync(path.join(__dirname, '../../sql/pv/02_pv_hour.sql'), 'utf-8');
    expect(pvHour).toMatch(/ENGINE = AggregatingMergeTree/i);

    const pvDay = fs.readFileSync(path.join(__dirname, '../../sql/pv/03_pv_day.sql'), 'utf-8');
    expect(pvDay).toMatch(/ENGINE = AggregatingMergeTree/i);
  });

  it('should have correct engine for article table', () => {
    const article = fs.readFileSync(
      path.join(__dirname, '../../sql/article/00_article.sql'),
      'utf-8'
    );
    expect(article).toMatch(/ENGINE = ReplacingMergeTree\(created_at\)/i);
    expect(article).toMatch(/ORDER BY \(organization_id_hash, url_hash\)/i);
  });

  it('should create required materialized views', () => {
    const mvToMin = fs.readFileSync(
      path.join(__dirname, '../../sql/pv/04_pv_raw_to_min_mv.sql'),
      'utf-8'
    );
    expect(mvToMin).toMatch(/CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_raw_to_min_mv/i);
    expect(mvToMin).toMatch(/TO lightscope.pv_min/i);
  });

  it('should not contain DROP TABLE without careful consideration', () => {
    const pvFiles = fs.readdirSync(path.join(__dirname, '../../sql/pv'));
    for (const file of pvFiles) {
      if (file.endsWith('.sql')) {
        const content = fs.readFileSync(path.join(__dirname, '../../sql/pv', file), 'utf-8');
        expect(content.toUpperCase()).not.toContain('DROP TABLE');
      }
    }
  });
});
