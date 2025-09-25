import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LoginHandler, RefreshTokenHandler } from './commands/handlers/auth-command.service';
import { GetMeHandler } from './queries/handlers/auth-query.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { MeQueryHandler } from './queries/me.hander';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginHandler,
    RefreshTokenHandler,
    GetMeHandler,
    JwtStrategy,
    JwtAuthGuard,
    MeQueryHandler
  ],
  exports: [JwtModule, JwtAuthGuard, AuthService, CqrsModule],
})
export class AuthModule {}
