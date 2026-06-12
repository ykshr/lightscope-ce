import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ClickHouseEgress from '@/helpers/egress/clickhouse';
import { createClient } from '@clickhouse/client';

vi.mock('@clickhouse/client', () => ({
  createClient: vi.fn().mockReturnValue({
    insert: vi.fn(),
  }),
}));

vi.mock('@/helpers/error', () => ({
  redactError: vi.fn((e) => ({ name: e.name, message: e.message, stack: e.stack })),
}));

describe('ClickHouseEgress', () => {
  let egress: ClickHouseEgress;
  let setIntervalSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setIntervalSpy = vi.spyOn(global, 'setInterval').mockImplementation(() => {
      return null as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default parameters', () => {
    egress = new ClickHouseEgress({
      clickhouseUrl: 'http://localhost:8123',
    });

    expect(createClient).toHaveBeenCalledWith({
      url: 'http://localhost:8123',
      username: undefined,
      password: undefined,
    });

    const egressAny = egress as any;
    expect(egressAny.insertBatchSize).toBe(1000);
    expect(egressAny.insertFlushIntervalMs).toBe(200);
    expect(egressAny.insertMaxTry).toBe(3);
  });

  it('should initialize with custom parameters', () => {
    egress = new ClickHouseEgress({
      clickhouseUrl: 'http://localhost:8123',
      insertBatchSize: '50',
      insertFlushIntervalMs: '1000',
      insertMaxTry: '5',
    });

    const egressAny = egress as any;
    expect(egressAny.insertBatchSize).toBe(50);
    expect(egressAny.insertFlushIntervalMs).toBe(1000);
    expect(egressAny.insertMaxTry).toBe(5);
  });

  it('should queue article buffers and flush automatically', async () => {
    egress = new ClickHouseEgress({ insertBatchSize: '2' });
    const clientMock = vi.mocked(createClient).mock.results[0].value;

    const article1 = { organization_id: 'org1', url: 'http://test1.com', title: 'Test 1' } as any;
    const article2 = { organization_id: 'org1', url: 'http://test2.com', title: 'Test 2' } as any;

    await egress.insertArticle(article1);
    expect(clientMock.insert).not.toHaveBeenCalled();

    await egress.insertArticle(article2);
    expect(clientMock.insert).toHaveBeenCalledTimes(1);
    expect(clientMock.insert).toHaveBeenCalledWith({
      table: 'lightscope.article',
      values: [article1, article2],
      format: 'JSONEachRow',
    });
  });

  it('should queue pv buffers and flush automatically', async () => {
    egress = new ClickHouseEgress({ insertBatchSize: '2' });
    const clientMock = vi.mocked(createClient).mock.results[0].value;

    const pv1 = { session_id: 'sess1' } as any;
    const pv2 = { session_id: 'sess2' } as any;

    await egress.insertPV(pv1);
    expect(clientMock.insert).not.toHaveBeenCalled();

    await egress.insertPV(pv2);
    expect(clientMock.insert).toHaveBeenCalledTimes(1);
    expect(clientMock.insert).toHaveBeenCalledWith({
      table: 'lightscope.pv_raw',
      values: [pv1, pv2],
      format: 'JSONEachRow',
    });
  });

  it('should handle insert errors and retry with correct logic', async () => {
    egress = new ClickHouseEgress({ insertBatchSize: '1', insertMaxTry: '3' });
    const clientMock = vi.mocked(createClient).mock.results[0].value;

    const error = new Error('Test DB Error');
    // First two tries reject, third resolves
    clientMock.insert
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const egressAny = egress as any;
    await egressAny.insert('test_table', [{ id: 1 }]);

    expect(clientMock.insert).toHaveBeenCalledTimes(3);
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'ClickHouse batch insert failed (try 0)',
      expect.any(Object)
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'ClickHouse batch insert failed (try 1)',
      expect.any(Object)
    );
  });

  it('should give up after max tries', async () => {
    egress = new ClickHouseEgress({ insertBatchSize: '1', insertMaxTry: '2' });
    const clientMock = vi.mocked(createClient).mock.results[0].value;

    const error = new Error('Test DB Error');
    clientMock.insert.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const egressAny = egress as any;
    await egressAny.insert('test_table', [{ id: 1 }]);

    expect(clientMock.insert).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'ClickHouse batch insert failed (try 0)',
      expect.any(Object)
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'ClickHouse batch insert failed (try 1)',
      expect.any(Object)
    );
  });

  it('should not throw if array is empty during insert', async () => {
    egress = new ClickHouseEgress({ insertBatchSize: '1' });
    const clientMock = vi.mocked(createClient).mock.results[0].value;

    const egressAny = egress as any;
    await egressAny.insert('test_table', []);
    await egressAny.insert('test_table', null);
    await egressAny.insert('test_table', undefined);

    expect(clientMock.insert).not.toHaveBeenCalled();
  });

  it('should call flush on interval via setInterval', () => {
    egress = new ClickHouseEgress({ insertFlushIntervalMs: '100' });
    expect(setIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy.mock.calls[0][1]).toBe(100);

    const flushSpy = vi.spyOn(egress as any, 'flushBuffer').mockImplementation(async () => {});
    const intervalCb = setIntervalSpy.mock.calls[0][0];
    intervalCb();

    expect(flushSpy).toHaveBeenCalledWith(true);
  });
});
