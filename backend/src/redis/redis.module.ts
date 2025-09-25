import { Module } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

export const REDIS_PUB = 'REDIS_PUB';
export const REDIS_SUB = 'REDIS_SUB';

@Module({
  providers: [
    {
      provide: REDIS_PUB,
      useFactory: (): RedisClient => {
        // REDIS_URL ví dụ: redis://:password@host:6379/0
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: +(process.env.REDIS_PORT || 6379),
          password: process.env.REDIS_PASSWORD || '',
          lazyConnect: true,
        });
      },
    },
    {
      provide: REDIS_SUB,
      useFactory: async (): Promise<RedisClient> => {
        const sub = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: +(process.env.REDIS_PORT || 6379),
          password: process.env.REDIS_PASSWORD || '',
          lazyConnect: true,
        });
        await sub.connect();
        // Pattern-subscribe ngay khi module khởi tạo (SseHub sẽ đăng ký handler)
        // Không psubscribe ở đây (để SseHub chủ động đăng ký & handle sự kiện)
        return sub;
      },
    },
  ],
  exports: [REDIS_PUB, REDIS_SUB],
})
export class RedisModule {}