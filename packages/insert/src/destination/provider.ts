import { type Article, type PV } from '@/types';

export default interface DestinationProvider {
  insertArticle(article: Article): Promise<void> | void;
  insertPV(pv: PV): Promise<void> | void;
}
