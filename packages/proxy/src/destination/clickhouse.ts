import dotenv from 'dotenv';
import { createClient } from '@clickhouse/client';
import { type PV, type Article } from '@/types';
import DestinationProvider from './provider';

dotenv.config();

const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST;
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME;
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
const CLICKHOUSE_INSERT_BATCH_SIZE = Number(process.env.BATCH_SIZE) || 1000;
const CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS =
  Number(process.env.CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS) || 200;
const CLICKHOUSE_INSERT_MAX_TRY = Number(process.env.INSERT_MAX_TRY) || 3;

if (!CLICKHOUSE_HOST || !CLICKHOUSE_USERNAME || !CLICKHOUSE_PASSWORD) {
  throw new Error(
    'CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, or CLICKHOUSE_PASSWORD is not defined in environment variables'
  );
}

export class ClickHouseDestination implements DestinationProvider {
  private articleBuffers: Record<string, Article> = {};
  private pvBuffers: PV[] = [];
  private clickhouseClient;

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
      Object.keys(this.articleBuffers).forEach((key) => delete this.articleBuffers[key]);
      await this.insert('lightscope.article', articlesToInsert);
    }

    // PV
    if (flush || this.pvBuffers.length >= CLICKHOUSE_INSERT_BATCH_SIZE) {
      const pvsToInsert = [...this.pvBuffers];
      this.pvBuffers.length = 0;
      await this.insert('lightscope.pv_raw', pvsToInsert);
    }
  }

  insertArticle(article: Article): void {
    const articleKey = `${article.tenant_id}:${article.url}`;
    this.articleBuffers[articleKey] = article;
    this.flushBuffer();
  }

  insertPV(pv: PV): void {
    this.pvBuffers.push(pv);
    this.flushBuffer();
  }
}
