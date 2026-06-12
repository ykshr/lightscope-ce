import { describe, expect, it } from 'vitest';
import processAllowedOriginsString from '@/helpers/allowedOrigins';

describe('processAllowedOriginsString', () => {
  it('should return undefined if input is undefined', () => {
    expect(processAllowedOriginsString(undefined)).toBeUndefined();
  });

  it('should return undefined if input is an empty string', () => {
    expect(processAllowedOriginsString('')).toBeUndefined();
  });

  it('should return an array with a single origin', () => {
    expect(processAllowedOriginsString('https://example.com')).toEqual(['https://example.com']);
  });

  it('should split multiple comma-separated origins and trim whitespace', () => {
    expect(
      processAllowedOriginsString('https://example.com, https://another.com ,http://localhost:3000')
    ).toEqual(['https://example.com', 'https://another.com', 'http://localhost:3000']);
  });
});
