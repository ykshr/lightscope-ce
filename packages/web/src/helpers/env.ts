// --------------------
// API
// --------------------
let API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
let PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://127.0.0.1:3002';

if (typeof window !== 'undefined') {
  const windowHostname = window.location.hostname;
  if (['localhost', '127.0.0.1'].includes(windowHostname)) {
    try {
      const apiUrlObj = new URL(API_URL);
      if (['localhost', '127.0.0.1'].includes(apiUrlObj.hostname)) {
        apiUrlObj.hostname = windowHostname;
        API_URL = apiUrlObj.toString().replace(/\/$/, '');
      }

      const proxyUrlObj = new URL(PROXY_URL);
      if (['localhost', '127.0.0.1'].includes(proxyUrlObj.hostname)) {
        proxyUrlObj.hostname = windowHostname;
        PROXY_URL = proxyUrlObj.toString().replace(/\/$/, '');
      }
    } catch (e) {
      console.error('Failed to parse API_URL or PROXY_URL', e);
    }
  }
}

export { API_URL, PROXY_URL };
