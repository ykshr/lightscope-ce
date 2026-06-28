import { describe, expect, it } from 'vitest';
import { redactError } from '@/helpers/error';

describe('redactError', () => {
  it('should redact a standard Error object', () => {
    const error = new Error('test message');
    const result = redactError(error);

    expect(result).toEqual({
      name: 'Error',
      message: 'test message',
    });
  });

  it('should redact a TypeError object', () => {
    const error = new TypeError('type error');
    const result = redactError(error);

    expect(result).toEqual({
      name: 'TypeError',
      message: 'type error',
    });
  });

  it('should redact custom properties on an Error object', () => {
    const error = new Error('test message') as any;
    error.status = 500;
    error.code = 'INTERNAL_ERROR';

    const result = redactError(error);

    expect(result).toEqual({
      name: 'Error',
      message: 'test message',
    });
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('code');
  });

  it('should return a string as is', () => {
    const input = 'just a string';
    expect(redactError(input)).toBe(input);
  });

  it('should return a number as is', () => {
    const input = 42;
    expect(redactError(input)).toBe(input);
  });

  it('should return null as is', () => {
    expect(redactError(null)).toBe(null);
  });

  it('should return undefined as is', () => {
    expect(redactError(undefined)).toBe(undefined);
  });

  it('should return a plain object as is', () => {
    const input = { foo: 'bar' };
    expect(redactError(input)).toEqual(input);
  });
});
