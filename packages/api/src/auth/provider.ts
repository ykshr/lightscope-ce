import { Request } from 'express';

export type User = {
  id: string;
  role: string;
  tenant_id?: number;
};

export default interface AuthProvider {
  getUser(req: Request): Promise<User | null>;
}
