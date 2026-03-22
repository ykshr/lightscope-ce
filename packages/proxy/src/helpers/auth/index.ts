import { Context } from 'hono';

export type Tracker = {
  tenantId: number;
};

export interface AuthProvider {
  getTracker(c: Context): Promise<Tracker | null>;
}
