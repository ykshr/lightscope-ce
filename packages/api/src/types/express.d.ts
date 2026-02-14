import { User } from '@/auth/provider';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
