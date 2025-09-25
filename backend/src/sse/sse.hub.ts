import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import type { Redis } from 'ioredis';
import { REDIS_SUB } from '../redis/redis.module';

export type MessageEvent = { data: any };

@Injectable()
export class SseHub implements OnModuleInit {
  private channels = new Map<string, Subject<MessageEvent>>();

  constructor(@Inject(REDIS_SUB) private readonly sub: Redis) {}

  async onModuleInit() {
    // Đăng ký nhận tất cả kênh dạng sse:*
    await this.sub.psubscribe('sse:*');
    this.sub.on('pmessage', (_pattern, channel, message) => {
      // channel = "sse:<channelId>"
      try {
        const [, channelId] = channel.split(':', 2);
        const subject = this.channels.get(channelId);
        if (subject) {
          subject.next({ data: this.safeParse(message) });
        }
      } catch {
        // noop
      }
    });
  }

  subscribe(channelId: string): Observable<MessageEvent> {
    let subject = this.channels.get(channelId);
    if (!subject) {
      subject = new Subject<MessageEvent>();
      this.channels.set(channelId, subject);
    }
    return subject.asObservable();
  }

  complete(channelId: string) {
    const subject = this.channels.get(channelId);
    subject?.complete();
    this.channels.delete(channelId);
  }

  private safeParse(input: string) {
    try { return JSON.parse(input); } catch { return input; }
  }
}