import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtStrategy } from './infrastructure/config/jwt.strategy';
import databaseConfig from './infrastructure/config/database.config';

// Application - Command Handlers
import { LoginHandler } from './application/use-cases/commands/login/login.handler';
import { RefreshTokenHandler } from './application/use-cases/commands/refresh-token/refresh-token.handler';
import { LogoutHandler } from './application/use-cases/commands/logout/logout.handler';

// Application - Query Handlers
import { GetUserHandler } from './application/use-cases/queries/get-user/get-user.handler';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { LogServiceName } from '@app/shared-constants';
import { ServiceName } from '@app/shared-constants';

// Infrastructure Clients
import { IamClientService } from './infrastructure/clients/iam-client.service';

const CommandHandlers = [
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    LoggerModule.forRoot(LogServiceName.AUTH_SERVICE),
    CqrsModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-default-secret-key-change-this',
      signOptions: { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 15 * 60 },
    }),
    // TCP Client for IAM Service
    ClientsModule.registerAsync([
      {
        name: ServiceName.IAM_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('IAM_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('IAM_SERVICE_PORT') || 3003),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    JwtStrategy,
    IamClientService,
  ],
})
export class AuthServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}