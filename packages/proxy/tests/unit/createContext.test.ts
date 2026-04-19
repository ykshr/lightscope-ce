import { describe, it, expect, vi, beforeEach } from 'vitest';
import createContext from '@/createContext';
import { env } from 'hono/adapter';
import ClickHouseEgress from '@/helpers/egress/clickhouse';
import MaxmindGeo from '@/helpers/geo/maxmind';
import JwtAuth from '@/helpers/auth/jwtAuth';

vi.mock('hono/adapter', () => ({
  env: vi.fn(),
}));

describe('createContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if JWT_SECRET is not defined', async () => {
    vi.mocked(env).mockReturnValue({});
    const c = {} as any;

    await expect(createContext(c)).rejects.toThrow('JWT_SECRET is not defined in the environment.');
  });

  it('should create context successfully with valid environment variables', async () => {
    vi.mocked(env).mockReturnValue({
      JWT_SECRET: 'test-secret',
      CLICKHOUSE_URL: 'http://localhost:8123',
      MAXMIND_DB_PATH: '/custom/path',
      CLICKHOUSE_USERNAME: 'user',
      CLICKHOUSE_PASSWORD: 'password',
      CLICKHOUSE_INSERT_BATCH_SIZE: '100',
      CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS: '1000',
      CLICKHOUSE_INSERT_MAX_TRY: '5',
    });

    const c = {} as any;

    vi.spyOn(MaxmindGeo.prototype, 'init').mockImplementation(async () => {});

    const context = await createContext(c);

    expect(context.auth).toBeDefined();
    expect(context.auth).toBeInstanceOf(JwtAuth);

    expect(context.egress).toBeDefined();
    expect(context.egress).toBeInstanceOf(ClickHouseEgress);

    expect(context.geo).toBeDefined();
    expect(context.geo).toBeInstanceOf(MaxmindGeo);
  });
});
