import { Request } from 'express';
import AuthProvider from './provider';

export class NoAuthProvider implements AuthProvider {
  async getUser(_req: Request) {
    return { id: 'anonymous', role: 'admin', tenant_id: 1 };
  }
}
