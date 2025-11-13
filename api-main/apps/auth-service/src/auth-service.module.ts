import { Module } from '@nestjs/common';
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

// Application - Query Handlers
import { GetUserHandler } from './application/use-cases/queries/get-user/get-user.handler';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';

const CommandHandlers = [
  RegisterHandler,
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
    CqrsModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-default-secret-key-change-this',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    JwtStrategy,
  ],
})
export class AuthServiceModule {}
