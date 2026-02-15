// TODO: Add unit tests - Test referrer parsing logic, including direct traffic, valid URLs, and invalid/unknown domains.
import * as psl from 'psl';

export default function processReferrer(referrer: string | undefined): {
  referrer: string;
  domain: string;
} {
  if (!referrer) {
    return {
      referrer: 'direct',
      domain: 'direct',
    };
  }
  try {
    const url = new URL(referrer);
    const hostname = url.hostname;

    const parsed = psl.parse(hostname);

    if ('error' in parsed || !parsed.domain)
      return {
        referrer,
        domain: 'unknown',
      };

    return {
      referrer,
      domain: parsed.domain,
    };
  } catch (e) {
    return {
      referrer,
      domain: 'unknown',
    };
  }
}
