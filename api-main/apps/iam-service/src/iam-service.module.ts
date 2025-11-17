import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_FILTER } from '@nestjs/core';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtStrategy } from './infrastructure/config/jwt.strategy';
import databaseConfig from './infrastructure/config/database.config';

// Application - Command Handlers
import { CreateUserHandler } from './application/use-cases/commands/users/create-user/create-user.handler';
import { UpdateUserHandler } from './application/use-cases/commands/users/update-user/update-user.handler';
import { DeleteUserHandler } from './application/use-cases/commands/users/delete-user/delete-user.handler';
import { AssignRolesHandler } from './application/use-cases/commands/users/assign-roles/assign-roles.handler';
import { CreateRoleHandler } from './application/use-cases/commands/roles/create-role/create-role.handler';

// Application - Query Handlers
import { GetUserByIdHandler } from './application/use-cases/queries/users/get-user-by-id/get-user-by-id.handler';
import { GetUsersHandler } from './application/use-cases/queries/users/get-users/get-users.handler';
import { GetUserPermissionsHandler } from './application/use-cases/queries/users/get-user-permissions/get-user-permissions.handler';
import { GetRolesHandler } from './application/use-cases/queries/roles/get-roles/get-roles.handler';
import { GetRoleByIdHandler } from './application/use-cases/queries/roles/get-role-by-id/get-role-by-id.handler';

// Presentation
import { UsersController } from './presentation/controllers/users.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';

// Shared
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { LogServiceEnum } from '@app/utils/service.enum';

const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  AssignRolesHandler,
  CreateRoleHandler,
];

const QueryHandlers = [
  GetUserByIdHandler,
  GetUsersHandler,
  GetUserPermissionsHandler,
  GetRolesHandler,
  GetRoleByIdHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    LoggerModule.forRoot(LogServiceEnum.IAM_SERVICE),
    CqrsModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-default-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [UsersController, RolesController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    JwtStrategy,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class IamServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
