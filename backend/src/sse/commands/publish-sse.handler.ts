import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PublishSseCommand } from "./publish-sse.command";
import type { Redis } from 'ioredis';
import * as dayjs from "dayjs";
import { REDIS_PUB } from "../../redis/redis.module";
import { Inject } from "@nestjs/common";

@CommandHandler(PublishSseCommand)
export class PublishSseHandler implements ICommandHandler<PublishSseCommand> {
    constructor(
        @Inject(REDIS_PUB) private readonly redisPub: Redis
    ) {}

    async execute(command: PublishSseCommand): Promise<any> {
        const { publishSseDto } = command;
        const { channel, event, data } = publishSseDto;
        const payload = {
            event,
            data,
            at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };

        const toPublish = JSON.stringify(payload);

        await this.redisPub.publish(`sse:${channel}`, toPublish);

        return command;
    }
}