import cors from 'cors';
import express from 'express';
import indexRouter from '@/rest/index';
import eventsRouter from '@/rest/events';
import graphql from '@/graphql';
import authMiddleware from '@/auth';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Public routes that don't require authentication
app.use('/', indexRouter);
app.get('/health', (_req, res) => res.json({ ok: true }));

// Events endpoint has its own tracker token authentication
app.use('/events', eventsRouter);

// Auth middleware - all routes below this require authentication for dashboard users
app.use(authMiddleware());
app.use('/gql', graphql);

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
  console.log(`api server listening on ${PORT}`);
});
