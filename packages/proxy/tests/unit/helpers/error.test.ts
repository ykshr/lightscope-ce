import { describe, it, expect } from 'vitest';
import { redactError } from '@/helpers/error';

describe('redactError', () => {
  it('should redact an Error object', () => {
    const error = new Error('test message');
    error.name = 'TestError';

    const redacted = redactError(error) as any;

    expect(redacted).toHaveProperty('name', 'TestError');
    expect(redacted).toHaveProperty('message', 'test message');
    expect(redacted).toHaveProperty('stack');
    expect(typeof redacted.stack).toBe('string');
  });

  it('should return the original value if not an Error object', () => {
    const errorString = 'this is a string error';
    const redactedString = redactError(errorString);
    expect(redactedString).toBe(errorString);

    const errorObj = { custom: 'error' };
    const redactedObj = redactError(errorObj);
    expect(redactedObj).toBe(errorObj);
  });
});
