import { createClient } from '@vercel/kv';
import RedisMock from 'ioredis-mock';
import { dev } from '$app/environment';
import { redisLogger } from './logger';

// טיפוסים למידע בסשן
export interface SessionData {
    userId: string;
    createdAt: number;
    expiresAt: number;
}

// יצירת חיבור Redis בהתאם לסביבה
const baseRedis = dev
    ? new RedisMock()
    : createClient({
          url: process.env.KV_REST_API_URL || '',
          token: process.env.KV_REST_API_TOKEN || ''
      });

// הוספת לוגים בסביבת פיתוח
const redis = dev
    ? {
          ...baseRedis,
          get: async (key: string) => {
              redisLogger.debug({ operation: 'GET', key }, 'Redis operation');
              return await baseRedis.get(key);
          },
          set: async (key: string, value: string | number | Buffer) => {
              redisLogger.debug({ operation: 'SET', key, value }, 'Redis operation');
              return await baseRedis.set(key, value);
          },
          del: async (key: string) => {
              redisLogger.debug({ operation: 'DEL', key }, 'Redis operation');
              return await baseRedis.del(key);
          }
      }
    : baseRedis;

export { redis };
