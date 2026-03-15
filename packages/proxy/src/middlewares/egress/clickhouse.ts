import { Context } from 'hono';
import { env } from 'hono/adapter';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import { EgressProvider } from './index';
import type { PV, Article } from '@/types';

let client: ClickHouseClient | null;

export class ClickHouseEgress implements EgressProvider {
  private insertBatchSize: number = 1000;
  private insertFlushIntervalMs: number = 200;
  private insertMaxTry: number = 3;
  private articleBuffers: Record<string, Article> = {};
  private pvBuffers: PV[] = [];

  constructor() {
    setInterval(async () => {
      await this.flushBuffer(true);
    }, this.insertFlushIntervalMs);
  }

  async setup(c: Context) {
    const {
      CLICKHOUSE_INSERT_BATCH_SIZE,
      CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
      CLICKHOUSE_INSERT_MAX_TRY,
    } = env(c);
    if (!isNaN(Number(CLICKHOUSE_INSERT_BATCH_SIZE)))
      this.insertBatchSize = Number(CLICKHOUSE_INSERT_BATCH_SIZE);
    if (!isNaN(Number(CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS)))
      this.insertFlushIntervalMs = Number(CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS);
    if (!isNaN(Number(CLICKHOUSE_INSERT_MAX_TRY)))
      this.insertMaxTry = Number(CLICKHOUSE_INSERT_MAX_TRY);

    if (!client) {
      const { CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } = env(c);
      client = createClient({
        host: CLICKHOUSE_HOST,
        username: CLICKHOUSE_USERNAME,
        password: CLICKHOUSE_PASSWORD,
      });
    }
  }

  private async insert(table: string, buffers: any[]) {
    if (!client) return;
    if (!buffers || buffers.length === 0) return;
    let tryCount = 0;
    while (tryCount < this.insertMaxTry) {
      try {
        await client.insert({
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
    if (flush || Object.keys(this.articleBuffers).length >= this.insertBatchSize) {
      const articlesToInsert = Object.values(this.articleBuffers);
      Object.keys(this.articleBuffers).forEach((key) => delete this.articleBuffers[key]);
      await this.insert('lightscope.article', articlesToInsert);
    }

    // PV
    if (flush || this.pvBuffers.length >= this.insertBatchSize) {
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
