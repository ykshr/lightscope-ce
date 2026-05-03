/**
 * Fallback method to resolve site name from URL
 * Example: https://sub.example.com/shop/item/123
 * => "sub.example.com"
 * Example: https://example.com/shop/item/123
 * => "/shop"
 */
export function resolveSiteName(): string {
  const { hostname, pathname } = window.location;
  const domainParts = hostname.split('.');
  if (domainParts.length > 2) {
    return hostname; // Return full hostname if subdomain exists
  }
  const pathSegments = pathname.split('/').filter(Boolean);
  return pathSegments.length > 0 ? `/${pathSegments[0]}` : '/';
}
