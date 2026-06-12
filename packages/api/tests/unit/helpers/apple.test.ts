import { describe, expect, it } from 'vitest';
import { generateAppleClientSecret } from '@/helpers/apple';

describe('generateAppleClientSecret', () => {
  it('should return undefined if clientId is missing', async () => {
    const result = await generateAppleClientSecret(undefined, 'teamId', 'keyId', 'privateKey');
    expect(result).toBeUndefined();
  });

  it('should return undefined if teamId is missing', async () => {
    const result = await generateAppleClientSecret('clientId', undefined, 'keyId', 'privateKey');
    expect(result).toBeUndefined();
  });

  it('should return undefined if keyId is missing', async () => {
    const result = await generateAppleClientSecret('clientId', 'teamId', undefined, 'privateKey');
    expect(result).toBeUndefined();
  });

  it('should return undefined if privateKey is missing', async () => {
    const result = await generateAppleClientSecret('clientId', 'teamId', 'keyId', undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined if all params are missing', async () => {
    const result = await generateAppleClientSecret(undefined, undefined, undefined, undefined);
    expect(result).toBeUndefined();
  });
});
