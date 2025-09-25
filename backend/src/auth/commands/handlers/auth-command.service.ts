import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LoginCommand } from '../impl/login.command';
import { RefreshTokenCommand } from '../impl/refresh-token.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../auth.service';
import { ApiException } from '../../../common/api.exception';
import { QueryBus } from '@nestjs/cqrs';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    private readonly logger = new Logger(LoginHandler.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async execute(command: LoginCommand): Promise<any> {
        this.logger.log(`Đăng nhập: ${command.username}`);
        try {
            // Tìm user theo username, national identity card hoặc social insurance code
            const user = await this.userRepository.findOne({
                where: [
                    { username: command.username },
                    { email: command.username },
                ]
            });

            // Kiểm tra user tồn tại
            if (!user) {
                this.logger.warn(`Đăng nhập thất bại: User không tồn tại - ${command.username}`);
                throw new ApiException('INVALID_CREDENTIALS');
            }

            // Kiểm tra password
            const isPasswordValid = await bcrypt.compare(command.password, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`Đăng nhập thất bại: Password không đúng - ${command.username}`);
                throw new ApiException('INVALID_CREDENTIALS');
            }

            // Kiểm tra user có bị khóa không
            if (user.isLock) {
                this.logger.warn(`Đăng nhập thất bại: User bị khóa - ${command.username}`);
                throw new ApiException('ACCOUNT_LOCKED');
            }

            if (!user.isActive) {
                this.logger.warn(`Đăng nhập thất bại: User chưa kích hoạt - ${command.username}`);
                throw new ApiException('ACCOUNT_NOT_ACTIVE');
            }

            // Cập nhật thông tin đăng nhập
            await this.userRepository.update(user.id, {
                lastLoginAt: new Date(),
                lastLoginIp: command.userAgent || undefined,
                lastLoginUserAgent: command.userAgent || undefined
            });

            this.logger.log(`Đăng nhập thành công: ${command.username}`);
            return user;
        } catch (error) {
            if (error instanceof ApiException) {
                throw error;
            }
            this.logger.error('Lỗi khi đăng nhập', error.stack);
            throw new ApiException('INTERNAL_SERVER_ERROR');
        }
    }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
    private readonly logger = new Logger(RefreshTokenHandler.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
        private readonly queryBus: QueryBus,
    ) {}

    async execute(command: RefreshTokenCommand): Promise<any> {
        this.logger.log('Làm mới access token');
        try {
            // Xác thực refresh token
            const payload = await this.authService.verifyRefreshToken(command.refreshToken);
            if (!payload) {
                throw new ApiException('INVALID_REFRESH_TOKEN');
            }

            // Tìm user
            const user = await this.userRepository.findOne({
                where: { id: payload.sub }
            });

            if (!user) {
                throw new ApiException('USER_NOT_FOUND');
            }

            if (user.isLock) {
                throw new ApiException('ACCOUNT_LOCKED');
            }

            // Tạo access token mới
            const newPayload = { 
                sub: user.id, 
                username: user.username, 
                userAgent: payload.userAgent
            };
            const accessToken = await this.authService['jwtService'].signAsync(newPayload, {
                secret: this.authService['configService'].get<string>('JWT_SECRET') || '',
                expiresIn: this.authService['configService'].get<string>('JWT_EXPIRES_IN') || '3600s',
            });

            // Tạo refresh token mới
            const refreshToken = await this.authService.generateRefreshToken(newPayload);

            this.logger.log('Làm mới access token thành công');
            return { accessToken, refreshToken };
        } catch (error) {
            if (error instanceof ApiException) {
                throw error;
            }
            this.logger.error('Lỗi khi làm mới access token', error.stack);
            throw new ApiException('INTERNAL_SERVER_ERROR');
        }
    }
} 