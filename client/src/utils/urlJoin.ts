/**
 * URL joining utility to prevent API path duplication issues
 * Prevents cases like `/api/api/` when combining base URL with paths
 */
export function urlJoin(base: string, ...paths: string[]): string {
  // Clean base URL - remove trailing slashes
  let result = base.replace(/\/+$/, '');

  for (const path of paths) {
    if (!path) {continue;}

    // Clean path - remove leading and trailing slashes, then add one leading slash
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    if (cleanPath) {
      result += '/' + cleanPath;
    }
  }

  return result;
}

/**
 * Global fetch interceptor to fix API URL duplication issues
 */
export function fixApiUrl(url: string): string {
  // Fix common duplication issue: /api/api/ -> /api/
  return url.replace(/\/api\/api\//g, '/api/');
}
