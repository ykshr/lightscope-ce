import { createClient } from '@clickhouse/client';
import {
  CLICKHOUSE_HOST,
  CLICKHOUSE_USERNAME,
  CLICKHOUSE_PASSWORD,
  CLICKHOUSE_INSERT_BATCH_SIZE,
  CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
  CLICKHOUSE_INSERT_MAX_TRY,
} from '@/helpers/env';
import { EgressProvider } from './index';
import type { PV, Article } from '@/types';

export default class ClickHouseEgress implements EgressProvider {
  private articleBuffers: Record<string, Article> = {};
  private pvBuffers: PV[] = [];
  private clickhouseClient: ReturnType<typeof createClient>;

  constructor() {
    this.clickhouseClient = createClient({
      url: CLICKHOUSE_HOST,
      username: CLICKHOUSE_USERNAME,
      password: CLICKHOUSE_PASSWORD,
    });

    setInterval(async () => {
      await this.flushBuffer(true);
    }, CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS);
  }

  private async insert(table: string, buffers: any[]) {
    if (!buffers || buffers.length === 0) return;
    let tryCount = 0;
    while (tryCount < CLICKHOUSE_INSERT_MAX_TRY) {
      try {
        await this.clickhouseClient.insert({
          table: table,
          values: buffers,
          format: 'JSONEachRow',
        });
        return;
      } catch (e) {
        console.error(`ClickHouse batch insert failed (try ${tryCount})`, e);
        tryCount++;
      }
    }
  }

  private async flushBuffer(flush = false) {
    // Article
    if (flush || Object.keys(this.articleBuffers).length >= CLICKHOUSE_INSERT_BATCH_SIZE) {
      const articlesToInsert = Object.values(this.articleBuffers);
      this.articleBuffers = {};
      await this.insert('lightscope.article', articlesToInsert);
    }

    // PV
    if (flush || this.pvBuffers.length >= CLICKHOUSE_INSERT_BATCH_SIZE) {
      const pvsToInsert = [...this.pvBuffers];
      this.pvBuffers.length = 0;
      await this.insert('lightscope.pv_raw', pvsToInsert);
    }
  }

  async insertArticle(article: Article): Promise<void> {
    const articleKey = `${article.tenant_id}:${article.url}`;
    this.articleBuffers[articleKey] = article;
    this.flushBuffer();
  }

  async insertPV(pv: PV): Promise<void> {
    this.pvBuffers.push(pv);
    this.flushBuffer();
  }
}
