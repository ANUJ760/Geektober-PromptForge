import { getCache, setCache } from '../utils/redis.js';

/**
 * Cache-aside Express middleware for GET requests.
 * @param {number} ttlSeconds - Time to live in seconds
 * @param {string} prefix - Key namespace prefix
 */
export function cacheMiddleware(ttlSeconds = 180, prefix = 'cache') {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Build unique cache key based on route and query string
    const key = `${prefix}:${req.originalUrl || req.url}`;

    try {
      const cached = await getCache(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }

      // Intercept res.json to populate cache on response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        res.setHeader('X-Cache', 'MISS');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
}
