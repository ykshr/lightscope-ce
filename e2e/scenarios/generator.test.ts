import { test, expect } from '@playwright/test';
import { generatePayload, generateMinimalPayload } from '../utils/generator';
import { UAParser } from 'ua-parser-js';

test.describe('Data Generator Logic Verification', () => {
  test('generatePayload should create a valid full payload structure', async () => {
    const payload = generatePayload();
    expect(payload.event_id).toBeDefined();
    expect(payload.user_agent).toBeDefined();
    expect(payload.ip).toBeDefined();
    
    // Check consistency between UA and OS/Browser
    const uaParser = new UAParser(payload.user_agent);
    const result = uaParser.getResult();

    // If ua-parser-js can detect OS, it should match our payload
    if (result.os.name) {
      expect(payload.os).toBe(result.os.name);
    }
    
    // Check that IP is a valid IP address (simple regex check)
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$/;
    // Faker generates valid IPs, but let's just ensure it's a string and looks roughly like an IP
    expect(payload.ip).toEqual(expect.stringMatching(ipRegex));
  });

  test('generateMinimalPayload should create a payload with required fields', async () => {
    const payload = generateMinimalPayload();
    expect(payload.event_id).toBeDefined();
    expect(payload.url).toBeDefined();
    expect(payload.user_agent).toBeDefined();
    // IP is not in minimal payload unless we add it, but Payload type has it optional.
    // generateMinimalPayload didn't add IP in previous implementation, let's check if we want it.
    // The previous implementation of generateMinimalPayload just calls faker.internet.userAgent()
    // It does NOT do the UAParser logic.
    // If the requirement is "random UA and IP", maybe minimal should also have it?
    // But "Minimal" usually means "only what is absolutely required by the API".
    // Let's assume Minimal is fine as is, but we can check valid types.
  });

  test('generatePayload should allow overrides', async () => {
    const customUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const payload = generatePayload({ user_agent: customUA });
    
    expect(payload.user_agent).toBe(customUA);
    expect(payload.os).toBe('macOS');
    expect(payload.app).toBe('Chrome');
  });
});