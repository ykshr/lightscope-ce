import { Hono } from 'hono';
import { name, version } from '../../package.json';

const router = new Hono();

router.get('/', (c) => {
  return c.json({ name, version });
});

export default router;
