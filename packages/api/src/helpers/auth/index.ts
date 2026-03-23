import { Context } from 'hono';

export type User = {
  id: string;
  role: string;
  tenantId: string;
};

export interface AuthProvider {
  getUser(c: Context): Promise<User | null>;
  handler(c: Context): Promise<Response>;
}
