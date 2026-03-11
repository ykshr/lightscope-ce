import { clickhouse } from '@/helpers/context';
import { type PV, type Article } from '@/types';
import DestinationProvider from './provider';

const {
  clickhouseClient,
  CLICKHOUSE_INSERT_BATCH_SIZE,
  CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
  CLICKHOUSE_INSERT_MAX_TRY,
} = clickhouse;

export class ClickHouseDestination implements DestinationProvider {
  private articleBuffers: Record<string, Article> = {};
  private pvBuffers: PV[] = [];

  constructor() {
    setInterval(async () => {
      await this.flushBuffer(true);
    }, CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS);
  }

  private async insert(table: string, buffers: any[]) {
    if (!buffers || buffers.length === 0) return;
    let tryCount = 0;
    while (tryCount < CLICKHOUSE_INSERT_MAX_TRY) {
      try {
        await clickhouseClient.insert({
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
