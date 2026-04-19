import { describe, it, expect, vi, beforeEach } from 'vitest';
import MaxmindGeo from '@/helpers/geo/maxmind';
import maxmind, { Reader, CityResponse } from 'maxmind';
import fs from 'fs';
import { Context } from 'hono';

vi.mock('maxmind', () => ({
  default: {
    open: vi.fn(),
  },
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
  },
}));

// Mock getConnInfo
vi.mock('@hono/node-server/conninfo', () => ({
  getConnInfo: vi.fn().mockReturnValue({
    remote: { address: '8.8.8.8' },
  }),
}));

import { getConnInfo } from '@hono/node-server/conninfo';

describe('MaxmindGeo', () => {
  let geo: MaxmindGeo;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockContext = (ip: string | null = null): Context =>
    ({
      req: {
        header: vi.fn().mockImplementation((name: string) => {
          if (name === 'x-forwarded-for') return ip;
          return null;
        }),
      },
    }) as unknown as Context;

  it('should initialize successfully when DB file exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockReader = {} as unknown as Reader<CityResponse>;
    vi.mocked(maxmind.open).mockResolvedValue(mockReader);

    geo = new MaxmindGeo('/valid/path.mmdb');
    await geo.init();

    expect(fs.existsSync).toHaveBeenCalledWith('/valid/path.mmdb');
    expect(maxmind.open).toHaveBeenCalledWith('/valid/path.mmdb');
    expect((geo as any).maxmindReader).toBe(mockReader);
  });

  it('should not throw if DB file does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    geo = new MaxmindGeo('/invalid/path.mmdb');
    await geo.init();

    expect(fs.existsSync).toHaveBeenCalledWith('/invalid/path.mmdb');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Maxmind DB not found at /invalid/path.mmdb. Geo lookup will be disabled.'
    );
    expect(maxmind.open).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle missing city data gracefully', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockResponse = {
      country: { iso_code: 'US' },
    };

    const mockReader = {
      get: vi.fn().mockReturnValue(mockResponse),
    } as unknown as Reader<CityResponse>;
    vi.mocked(maxmind.open).mockResolvedValue(mockReader);

    geo = new MaxmindGeo('/valid/path.mmdb');
    await geo.init();

    const c = createMockContext('8.8.8.8');
    const data = await geo.getGeoData(c);

    expect(data).toEqual({
      continent: undefined,
      country: 'US',
      city: undefined,
      subdivision: undefined,
    });
  });

  it('should return empty geo object if reader is not initialized', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    geo = new MaxmindGeo('/invalid/path.mmdb');
    await geo.init();

    const c = createMockContext('8.8.8.8');
    const data = await geo.getGeoData(c);
    expect(data).toEqual({
      continent: undefined,
      country: undefined,
      subdivision: undefined,
      city: undefined,
    });
  });

  it('should return empty geo object if lookup returns null', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockReader = {
      get: vi.fn().mockReturnValue(null),
    } as unknown as Reader<CityResponse>;
    vi.mocked(maxmind.open).mockResolvedValue(mockReader);

    geo = new MaxmindGeo('/valid/path.mmdb');
    await geo.init();

    const c = createMockContext('8.8.8.8');
    const data = await geo.getGeoData(c);

    expect(mockReader.get).toHaveBeenCalledWith('8.8.8.8');
    expect(data).toEqual({
      continent: undefined,
      country: undefined,
      subdivision: undefined,
      city: undefined,
    });
  });

  it('should return empty geo object if ip is empty', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockReader = {
      get: vi.fn(),
    } as unknown as Reader<CityResponse>;
    vi.mocked(maxmind.open).mockResolvedValue(mockReader);

    // Mock getConnInfo to return empty address
    vi.mocked(getConnInfo).mockReturnValueOnce({ remote: { address: '' } } as any);

    geo = new MaxmindGeo('/valid/path.mmdb');
    await geo.init();

    const c = createMockContext(null); // No x-forwarded-for
    const data = await geo.getGeoData(c);

    expect(mockReader.get).not.toHaveBeenCalled();
    expect(data).toEqual({
      continent: undefined,
      country: undefined,
      subdivision: undefined,
      city: undefined,
    });
  });

  it('should return correct geo data on successful lookup', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const mockResponse = {
      continent: { code: 'NA' },
      country: { iso_code: 'US' },
      city: { names: { en: 'New York' } },
      subdivisions: [{ names: { en: 'New York' }, iso_code: 'NY' }],
      location: { latitude: 40.7128, longitude: -74.006 },
    };

    const mockReader = {
      get: vi.fn().mockReturnValue(mockResponse),
    } as unknown as Reader<CityResponse>;
    vi.mocked(maxmind.open).mockResolvedValue(mockReader);

    geo = new MaxmindGeo('/valid/path.mmdb');
    await geo.init();

    const c = createMockContext('8.8.8.8');
    const data = await geo.getGeoData(c);

    expect(data).toEqual({
      continent: 'NA',
      country: 'US',
      city: 'New York',
      subdivision: 'NY',
    });
  });

  it('should get ip from getConnInfo if x-forwarded-for is absent', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const mockResponse = {
      country: { iso_code: 'US' },
    };

    const mockReader = {
      get: vi.fn().mockReturnValue(mockResponse),
    } as unknown as Reader<CityResponse>;
    vi.mocked(maxmind.open).mockResolvedValue(mockReader);

    vi.mocked(getConnInfo).mockReturnValueOnce({ remote: { address: '9.9.9.9' } } as any);

    geo = new MaxmindGeo('/valid/path.mmdb');
    await geo.init();

    const c = createMockContext(null); // no header
    const data = await geo.getGeoData(c);

    expect(getConnInfo).toHaveBeenCalledWith(c);
    expect(mockReader.get).toHaveBeenCalledWith('9.9.9.9');
    expect(data.country).toBe('US');
  });
});
