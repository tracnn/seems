import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { QueryBus } from '@nestjs/cqrs';
import { MeQuery } from './queries/me.query';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly queryBus: QueryBus,
    ) { }

    private readonly saltRounds = 10;

    async hashPassword(password: string): Promise<string> {
      return bcrypt.hash(password, this.saltRounds);
    }
  
    async comparePassword(plain: string, hash: string): Promise<boolean> {
      return bcrypt.compare(plain, hash);
    }

    // Tạo refresh token
    async generateRefreshToken(payload: any): Promise<string> {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
            expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '1d',
        });
    }

    // Xác thực refresh token (trả về payload nếu hợp lệ, lỗi nếu không)
    async verifyRefreshToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
            });
        } catch (err) {
            return null;
        }
    }

    async me(userId: string) {
        return await this.queryBus.execute(new MeQuery(userId));
    }
}
