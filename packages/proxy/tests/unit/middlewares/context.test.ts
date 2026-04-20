import { describe, it, expect, vi } from 'vitest';
import createContextMiddleware from '@/middlewares/context';
import { Context } from 'hono';

describe('createContextMiddleware', () => {
  it('should initialize and set context on the first call, and reuse it on subsequent calls', async () => {
    const mock$ = { some: 'context', another: 'value' };
    const createContextMock = vi.fn().mockResolvedValue(mock$);
    const middleware = createContextMiddleware(createContextMock as any);

    const c1 = {
      set: vi.fn(),
    } as unknown as Context;
    const next1 = vi.fn().mockResolvedValue(undefined);

    await middleware(c1, next1);

    expect(createContextMock).toHaveBeenCalledTimes(1);
    expect(createContextMock).toHaveBeenCalledWith(c1);
    expect(c1.set).toHaveBeenCalledWith('$', mock$);
    expect(next1).toHaveBeenCalledTimes(1);

    const c2 = {
      set: vi.fn(),
    } as unknown as Context;
    const next2 = vi.fn().mockResolvedValue(undefined);

    await middleware(c2, next2);

    // Should not call createContext again
    expect(createContextMock).toHaveBeenCalledTimes(1);
    expect(c2.set).toHaveBeenCalledWith('$', mock$);
    expect(next2).toHaveBeenCalledTimes(1);
  });
});
