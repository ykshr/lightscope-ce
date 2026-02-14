import { Router, Request, Response, NextFunction } from 'express';
import { name, version } from '@/../package.json';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({ name, version });
});

export default router;
