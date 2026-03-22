import { type Article, type PV } from '@/types';

export interface EgressProvider {
  insertArticle(article: Article): Promise<void>;
  insertPV(pv: PV): Promise<void>;
}
