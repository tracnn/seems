import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtStrategy } from './infrastructure/config/jwt.strategy';
import databaseConfig from './infrastructure/config/database.config';

// Application - Command Handlers
import { RegisterHandler } from './application/use-cases/commands/register/register.handler';
import { LoginHandler } from './application/use-cases/commands/login/login.handler';
import { RefreshTokenHandler } from './application/use-cases/commands/refresh-token/refresh-token.handler';
import { LogoutHandler } from './application/use-cases/commands/logout/logout.handler';
import { ActivateAccountHandler } from './application/use-cases/commands/activate-account/activate-account.handler';

// Application - Query Handlers
import { GetUserHandler } from './application/use-cases/queries/get-user/get-user.handler';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  ActivateAccountHandler,
];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    LoggerModule.forRoot('auth-service'),
    CqrsModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-default-secret-key-change-this',
      signOptions: { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 15 * 60 },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    JwtStrategy,
  ],
})
export class AuthServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}