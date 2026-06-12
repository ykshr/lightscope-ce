import { describe, expect, it } from 'vitest';
import processAllowedOriginsString from '@/helpers/allowedOrigins';

describe('processAllowedOriginsString', () => {
  it('should return undefined if allowedOrigins is undefined', () => {
    expect(processAllowedOriginsString(undefined)).toBeUndefined();
  });

  it('should return undefined if allowedOrigins is an empty string', () => {
    expect(processAllowedOriginsString('')).toBeUndefined();
  });

  it('should return a single origin array for a single origin', () => {
    expect(processAllowedOriginsString('http://localhost:3000')).toEqual(['http://localhost:3000']);
  });

  it('should return multiple origins correctly split by comma', () => {
    expect(processAllowedOriginsString('http://localhost:3000,https://example.com')).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ]);
  });

  it('should trim whitespace from origins', () => {
    expect(processAllowedOriginsString(' http://localhost:3000 , https://example.com  ')).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ]);
  });

  it('should handle trailing commas', () => {
    expect(processAllowedOriginsString('http://localhost:3000,')).toEqual([
      'http://localhost:3000',
      '',
    ]);
  });
});
