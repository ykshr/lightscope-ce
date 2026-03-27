import { Context } from 'hono';

export type Tracker = {
  organizationId: string;
};

export interface AuthProvider {
  getTracker(c: Context): Promise<Tracker | null>;
}
