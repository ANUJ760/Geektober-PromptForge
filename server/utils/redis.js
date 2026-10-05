import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient = null;
let isRedisConnected = false;

// Fallback in-memory cache when Redis is not running
const memoryCache = new Map();

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // Stop retrying and fallback to in-memory cache
      }
      return Math.min(times * 100, 1000);
    },
    lazyConnect: true,
  });

  redisClient
    .connect()
    .then(() => {
      isRedisConnected = true;
      console.log('Connected to Redis server.');
    })
    .catch((err) => {
      console.log('Redis server not reachable, using in-memory cache fallback:', err.message);
      isRedisConnected = false;
    });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
  });
} catch (err) {
  console.log('Redis client init fallback:', err.message);
}

/**
 * Retrieves cached JSON item by key.
 */
export async function getCache(key) {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      // Fallback below
    }
  }

  // Memory cache fallback
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
}

/**
 * Stores JSON item with TTL in seconds.
 */
export async function setCache(key, value, ttlSeconds = 180) {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
      return;
    } catch {
      // Fallback below
    }
  }

  // Memory cache fallback
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate cache key or pattern.
 */
export async function invalidateCache(prefix) {
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Fallback
    }
  }

  // Memory cache fallback
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

export default redisClient;
