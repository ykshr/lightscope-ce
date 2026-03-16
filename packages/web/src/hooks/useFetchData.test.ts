import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFetchData, serializeDates } from '../hooks/useFetchData';
import { useAuth } from '@/contexts/AuthContext';

// Mock the AuthContext hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('fetcher lib', () => {
  describe('serializeDates', () => {
    it('should return null/undefined/primitives as is', () => {
      expect(serializeDates(null)).toBe(null);
      expect(serializeDates(undefined)).toBe(undefined);
      expect(serializeDates('string')).toBe('string');
      expect(serializeDates(123)).toBe(123);
      expect(serializeDates(true)).toBe(true);
    });

    it('should serialize Date objects to ISO string', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      expect(serializeDates(date)).toBe('2023-01-01T12:00:00.000Z');
    });

    it('should handle arrays recursively', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const input = [date, 123];
      const output = serializeDates(input);
      expect(output[0]).toBe('2023-01-01T12:00:00.000Z');
      expect(output[1]).toBe(123);
    });

    it('should handle objects recursively', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const input = { a: date, b: { c: date } };
      const output = serializeDates(input);
      expect(output.a).toBe('2023-01-01T12:00:00.000Z');
      expect(output.b.c).toBe('2023-01-01T12:00:00.000Z');
    });

    it('should handle complex nested structures', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const input = {
        list: [{ created_at: date }, { updated_at: null }],
      };
      const output = serializeDates(input);
      expect(output.list[0].created_at).toBe('2023-01-01T12:00:00.000Z');
      expect(output.list[1].updated_at).toBe(null);
    });
  });

  describe('useFetchData error handling', () => {
    const mockGetToken = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();

      // Default auth mock setup
      (useAuth as any).mockReturnValue({
        auth: {
          getToken: mockGetToken.mockResolvedValue('mock-token'),
        },
      });

      // Mock global fetch
      globalThis.fetch = vi.fn();
    });

    it('should throw Error when network response is not ok and json contains errors array', async () => {
      const mockFetchResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          errors: [{ message: 'Specific GraphQL Error' }],
        }),
      };
      (globalThis.fetch as any).mockResolvedValue(mockFetchResponse);

      const { result } = renderHook(() => useFetchData('query { test }'));

      await expect(result.current()).rejects.toThrow('Specific GraphQL Error');
    });

    it('should throw "Response was not ok - no error message" when network response is not ok and json.errors array is empty due to destructuring behavior', async () => {
      const mockFetchResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          errors: [],
        }),
      };
      (globalThis.fetch as any).mockResolvedValue(mockFetchResponse);

      const { result } = renderHook(() => useFetchData('query { test }'));

      await expect(result.current()).rejects.toThrow('Response was not ok - no error message');
    });

    it('should throw provided message when network response is not ok and no errors array exists', async () => {
      const mockFetchResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          message: 'Custom server error message',
        }),
      };
      (globalThis.fetch as any).mockResolvedValue(mockFetchResponse);

      const { result } = renderHook(() => useFetchData('query { test }'));

      await expect(result.current()).rejects.toThrow('Custom server error message');
    });

    it('should throw default message when network response is not ok and no error information is provided', async () => {
      const mockFetchResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      };
      (globalThis.fetch as any).mockResolvedValue(mockFetchResponse);

      const { result } = renderHook(() => useFetchData('query { test }'));

      await expect(result.current()).rejects.toThrow('Response was not ok - no message');
    });
  });
});
