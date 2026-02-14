import { Request, Response, NextFunction } from 'express';
import createAuthProvider from './factory';

export default function authMiddleware() {
  const auth = createAuthProvider();

  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await auth.getUser(req);

    if (!user) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    req.user = user;
    next();
  };
}
