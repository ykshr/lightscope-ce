import { Context } from 'hono';

export type Tracker = {
  tenantId: string;
};

export interface AuthProvider {
  getTracker(c: Context): Promise<Tracker | null>;
}
