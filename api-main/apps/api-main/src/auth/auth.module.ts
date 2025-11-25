import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceName } from '@app/shared-constants';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '@app/shared-guards';
import { ErrorService } from '@app/shared-exceptions';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret:
          configService.get<string>('JWT_SECRET') ??
          'your-default-secret-key-change-this',
        signOptions: {
          expiresIn:
            Number(configService.get<number>('JWT_EXPIRES_IN')) ?? 15 * 60,
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: ServiceName.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST ?? '0.0.0.0',
          port: Number(process.env.AUTH_SERVICE_PORT ?? 4001),
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: ErrorService,
      useFactory: () => new ErrorService('api-main'),
    },
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtStrategy, JwtAuthGuard, PassportModule],
})
export class AuthModule {}
