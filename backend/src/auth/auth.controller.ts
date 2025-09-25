import { Controller, UseGuards, Get, Post, Body, Req, Patch, Query, Delete } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from './commands/impl/login.command';
import { RefreshTokenCommand } from './commands/impl/refresh-token.command';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { USER_TYPE } from '../constants/common.constant';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly authService: AuthService,
    ) { }

    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get current user information' })
    @ApiResponse({ status: 200, description: 'Return current user information', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: any) {
        return await this.authService.me(req.user.userId);
    }

    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @Post('login')
    async login(@Body() body: LoginDto, @Req() req: Request) {
        const userAgent = (req.headers['user-agent'] as string) || '';
        // Gọi CQRS handler để xác thực user
        const user = await this.commandBus.execute(new LoginCommand({ ...body, userAgent }));

        // Tạo accessToken và refreshToken
        const payload = { 
            sub: user.id, 
            type: USER_TYPE.USER,
            username: user.username, 
            userAgent,
        };
        const accessToken = await this.authService['jwtService'].signAsync(payload, {
            secret: this.authService['configService'].get<string>('JWT_SECRET') || '',
            expiresIn: this.authService['configService'].get<string>('JWT_EXPIRES_IN') || '3600s',
        });
        const refreshToken = await this.authService.generateRefreshToken(payload);
        return { accessToken, refreshToken };
    }

    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refresh successful', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    @Post('refresh')
    async refreshToken(@Body() body: RefreshTokenDto) {
        return this.commandBus.execute(new RefreshTokenCommand(body.refreshToken));
    }
}
