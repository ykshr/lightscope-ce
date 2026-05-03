import type { PageMetadata } from '@/types';

/**
 * Extract information from OpenGraph and Article meta tags
 */
export function extractPageMetadata(pageMetadata: Partial<PageMetadata> = {}): PageMetadata {
  const metaMap: Record<string, string[]> = Object.create(null);
  const metaTags = document.getElementsByTagName('meta');
  for (let i = 0; i < metaTags.length; i++) {
    const el = metaTags[i];
    const property = el.getAttribute('property');
    const name = el.getAttribute('name');
    const content = el.getAttribute('content');

    if (!content) continue;

    if (property) {
      if (!metaMap[property]) metaMap[property] = [];
      metaMap[property].push(content);
    }
    if (name && name !== property) {
      if (!metaMap[name]) metaMap[name] = [];
      metaMap[name].push(content);
    }
  }

  const getMeta = (props: string[]) => {
    for (let i = 0; i < props.length; i++) {
      const val = metaMap[props[i]];
      if (val && val.length > 0) return val[0];
    }
    return;
  };

  const getMetaArray = (prop: string) => {
    return metaMap[prop] || [];
  };

  return {
    url: window.location.href,
    title: document.title,
    site_name: resolveSiteName(),
    locale: navigator.language,
    'og:url': getMeta(['og:url']),
    'og:title': getMeta(['og:title']),
    'og:type': getMeta(['og:type']),
    'og:image':
      getMeta(['og:image:secure_url']) || getMeta(['og:image:url']) || getMeta(['og:image']),
    'og:description': getMeta(['og:description', 'description']),
    'og:site_name': getMeta(['og:site_name']),
    'og:locale': getMeta(['og:locale']),
    'article:published_time': formatDate(getMeta(['article:published_time'])),
    'article:modified_time': formatDate(getMeta(['article:modified_time'])),
    'article:expiration_time': formatDate(getMeta(['article:expiration_time'])),
    'article:authors': getMetaArray('article:author'),
    'article:section': getMeta(['article:section']),
    'article:tags': getMetaArray('article:tag'),
    ...pageMetadata,
  };
}

/**
 * Fallback method to resolve site name from URL
 * Example: https://sub.example.com/shop/item/123
 * => "sub.example.com"
 * Example: https://example.com/shop/item/123
 * => "/shop"
 */
function resolveSiteName(): string {
  const { hostname, pathname } = window.location;
  const domainParts = hostname.split('.');
  if (domainParts.length > 2) {
    return hostname; // Return full hostname if subdomain exists
  }
  const pathSegments = pathname.split('/').filter(Boolean);
  return pathSegments.length > 0 ? `/${pathSegments[0]}` : '/';
}

function formatDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().replace('T', ' ').split('.')[0];
  } catch {
    return undefined;
  }
}
