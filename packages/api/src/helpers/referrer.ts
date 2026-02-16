import { getDomain } from 'tldts';

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

    const domain = getDomain(hostname, { allowPrivateDomains: true });

    if (!domain)
      return {
        referrer,
        domain: 'unknown',
      };

    return {
      referrer,
      domain: domain,
    };
  } catch (e) {
    return {
      referrer,
      domain: 'unknown',
    };
  }
}
