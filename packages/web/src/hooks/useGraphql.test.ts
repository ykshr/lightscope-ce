import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { serializeDates, useGraphql } from './useGraphql';

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

  describe('useGraphql error handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      // Mock global fetch
      vi.spyOn(globalThis, 'fetch');
    });

    it('should throw Error when network response is not ok and json contains errors array', async () => {
      const mockFetchResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            errors: [{ message: 'Specific GraphQL Error' }],
          })
        ),
      };
      vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse as any);

      const { result } = renderHook(() => useGraphql('query { test }'));

      await expect(result.current()).rejects.toThrow('Specific GraphQL Error');
    });

    it('should throw "Response was not ok - no error message" when network response is not ok and json.errors array is empty due to destructuring behavior', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            errors: [],
          })
        ),
      };
      vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse as any);

      const { result } = renderHook(() => useGraphql('query { test }'));

      await expect(result.current()).rejects.toThrow('Response was not ok - 500: {"errors":[]}');
    });

    it('should throw provided message when network response is not ok and no errors array exists', async () => {
      const mockFetchResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            message: 'Custom server error message',
          })
        ),
      };
      vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse as any);

      const { result } = renderHook(() => useGraphql('query { test }'));

      await expect(result.current()).rejects.toThrow('Custom server error message');
    });

    it('should throw default message when network response is not ok and no error information is provided', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(JSON.stringify({})),
      };
      vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse as any);

      const { result } = renderHook(() => useGraphql('query { test }'));

      await expect(result.current()).rejects.toThrow('Response was not ok - 500: {}');
    });
  });
});
