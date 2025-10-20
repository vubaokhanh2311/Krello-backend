import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    super({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  async onModuleDestroy() {
    await this.quit();
  }

  /**
   * Store values in Redis
   * @param key name key
   * @param value Data to be saved (object, array, string...)
   * @param ttl Lifetime (seconds)
   */
  async setCache(key: string, value: any, ttl?: number): Promise<void> {
    const jsonValue = JSON.stringify(value);
    if (ttl) {
      await this.set(key, jsonValue, 'EX', ttl);
    } else {
      await this.set(key, jsonValue);
    }
  }

  async getCache<T = any>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delCache(key: string): Promise<void> {
    await this.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      await this.del(keys);
    }
  }
}
