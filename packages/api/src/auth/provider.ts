import { Context } from 'hono';

export type User = {
  id: string;
  role: string;
  tenant_id?: number;
};

export default interface AuthProvider {
  getUser(c: Context): Promise<User | null>;
}
