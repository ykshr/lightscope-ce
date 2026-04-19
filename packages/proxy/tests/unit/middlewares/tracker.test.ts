import { describe, it, expect, vi } from 'vitest';
import createTrackerMiddleware from '@/middlewares/tracker';
import { Context } from 'hono';

describe('createTrackerMiddleware', () => {
  it('should return 401 if tracker is not found', async () => {
    const middleware = createTrackerMiddleware();
    const c = {
      var: {
        $: {
          auth: {
            getTracker: vi.fn().mockResolvedValue(null),
          },
        },
      },
      json: vi.fn().mockReturnValue('mock_json_response'),
    } as unknown as Context;
    const next = vi.fn().mockResolvedValue(undefined);

    const result = await middleware(c, next);

    expect(c.var.$.auth.getTracker).toHaveBeenCalledWith(c);
    expect(c.json).toHaveBeenCalledWith({ error: 'unauthorized' }, 401);
    expect(result).toBe('mock_json_response');
    expect(next).not.toHaveBeenCalled();
  });

  it('should set tracker and call next if tracker is found', async () => {
    const mockTracker = { id: 'test_tracker' };
    const middleware = createTrackerMiddleware();
    const c = {
      var: {
        $: {
          auth: {
            getTracker: vi.fn().mockResolvedValue(mockTracker),
          },
        },
      },
      set: vi.fn(),
    } as unknown as Context;
    const next = vi.fn().mockResolvedValue('mock_next_response');

    const result = await middleware(c, next);

    expect(c.var.$.auth.getTracker).toHaveBeenCalledWith(c);
    expect(c.set).toHaveBeenCalledWith('tracker', mockTracker);
    expect(next).toHaveBeenCalledTimes(1);
    expect(result).toBe('mock_next_response');
  });
});
