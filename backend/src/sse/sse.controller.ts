import { Controller, Get, Sse, Req, Res, UseGuards, Header, UnauthorizedException, Query, BadRequestException, Post } from '@nestjs/common';
import { map, merge, interval } from 'rxjs';
import { SseHub, MessageEvent } from './sse.hub';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { PublishSseCommand } from './commands/publish-sse.command';

@Controller('sse')
export class SseController {
    constructor(private readonly hub: SseHub, private readonly commandBus: CommandBus) {}

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @Sse()
    @Header('Cache-Control', 'no-cache, no-transform')
    @Header('Connection', 'keep-alive')
    @Header('X-Accel-Buffering', 'no')
    async streamByChannelAdmin(
        @Req() req: any,
    ) {

        const user = req.user as any;
        const userId = String(user?.userId ?? user?.id ?? '');

        if (!userId) throw new UnauthorizedException('Unauthorized');

        return this.hub.subscribe(userId);
    }

    //TODO: test publish sse
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Post('test')
    async test(@Req() req: any) {
        const user = req.user as any;
        const userId = String(user?.userId ?? user?.id ?? '');

        if (!userId) throw new UnauthorizedException('Unauthorized');

        this.commandBus.execute(new PublishSseCommand({ 
            channel: userId, 
            event: 'test.sse',
            data: { message: 'Hello, world!' } 
        }));

        return { message: 'SSE published' };
    }
}