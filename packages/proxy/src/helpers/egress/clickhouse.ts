import type { Article, PV } from '@/types';
import { ClickHouseClient, createClient } from '@clickhouse/client';
import { EgressProvider } from './index';

type ClickHouseEgressConfig = {
  insertBatchSize?: string;
  insertFlushIntervalMs?: string;
  insertMaxTry?: string;
  clickhouseUrl?: string;
  clickhouseUsername?: string;
  clickhousePassword?: string;
};

export default class ClickHouseEgress implements EgressProvider {
  private client: ClickHouseClient;
  private insertBatchSize: number = 1000;
  private insertFlushIntervalMs: number = 200;
  private insertMaxTry: number = 3;
  private articleBuffers: Record<string, Article> = {};
  private pvBuffers: PV[] = [];

  constructor(config: ClickHouseEgressConfig) {
    const {
      insertBatchSize,
      insertFlushIntervalMs,
      insertMaxTry,
      clickhouseUrl,
      clickhouseUsername,
      clickhousePassword,
    } = config;
    if (!isNaN(Number(insertBatchSize))) this.insertBatchSize = Number(insertBatchSize);
    if (!isNaN(Number(insertFlushIntervalMs)))
      this.insertFlushIntervalMs = Number(insertFlushIntervalMs);
    if (!isNaN(Number(insertMaxTry))) this.insertMaxTry = Number(insertMaxTry);

    this.client = createClient({
      url: clickhouseUrl,
      username: clickhouseUsername,
      password: clickhousePassword,
    });

    setInterval(async () => {
      await this.flushBuffer(true);
    }, this.insertFlushIntervalMs);
  }

  private async insert(table: string, buffers: any[]) {
    if (!buffers || buffers.length === 0) return;
    let tryCount = 0;
    while (tryCount < this.insertMaxTry) {
      try {
        await this.client.insert({
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
      this.articleBuffers = {};
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
    const articleKey = `${article.organization_id}:${article.url}`;
    this.articleBuffers[articleKey] = article;
    this.flushBuffer();
  }

  async insertPV(pv: PV): Promise<void> {
    this.pvBuffers.push(pv);
    this.flushBuffer();
  }
}
