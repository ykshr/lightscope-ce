import { Context } from 'hono';

export type User = {
  id: string;
  role: string;
  tenantId: number;
};

export interface AuthProvider {
  getUser(c: Context): Promise<User | null>;
  handler(c: Context): Promise<Response>;
}
