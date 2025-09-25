import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { SseHub } from './sse.hub';
import { SseController } from './sse.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { PublishSseHandler } from './commands/publish-sse.handler';

const CommandHandlers = [
  PublishSseHandler
];

@Module({
  imports: [RedisModule, CqrsModule],
  controllers: [SseController],
  providers: [SseHub, ...CommandHandlers],
  exports: [SseHub, CqrsModule],
})
export class SseModule {}