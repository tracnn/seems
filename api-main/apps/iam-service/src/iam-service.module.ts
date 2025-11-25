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

// Application - Command Handlers - Users
import { CreateUserHandler } from './application/use-cases/commands/users/create-user/create-user.handler';
import { UpdateUserHandler } from './application/use-cases/commands/users/update-user/update-user.handler';
import { DeleteUserHandler } from './application/use-cases/commands/users/delete-user/delete-user.handler';
import { AssignRolesHandler } from './application/use-cases/commands/users/assign-roles/assign-roles.handler';
import { AssignOrganizationsHandler } from './application/use-cases/commands/users/assign-organizations/assign-organizations.handler';
import { RemoveOrganizationsHandler } from './application/use-cases/commands/users/remove-organizations/remove-organizations.handler';
import { ActivateAccountHandler } from './application/use-cases/commands/users/activate-account/activate-account.handler';

// Application - Command Handlers - Roles
import { CreateRoleHandler } from './application/use-cases/commands/roles/create-role/create-role.handler';
import { UpdateRoleHandler } from './application/use-cases/commands/roles/update-role/update-role.handler';
import { DeleteRoleHandler } from './application/use-cases/commands/roles/delete-role/delete-role.handler';
import { AssignPermissionsHandler } from './application/use-cases/commands/roles/assign-permissions/assign-permissions.handler';
import { RemovePermissionsHandler } from './application/use-cases/commands/roles/remove-permissions/remove-permissions.handler';

// Application - Command Handlers - Permissions
import { CreatePermissionHandler } from './application/use-cases/commands/permissions/create-permission/create-permission.handler';
import { UpdatePermissionHandler } from './application/use-cases/commands/permissions/update-permission/update-permission.handler';
import { DeletePermissionHandler } from './application/use-cases/commands/permissions/delete-permission/delete-permission.handler';

// Application - Command Handlers - Organizations
import { CreateOrganizationHandler } from './application/use-cases/commands/organizations/create-organization/create-organization.handler';
import { UpdateOrganizationHandler } from './application/use-cases/commands/organizations/update-organization/update-organization.handler';
import { DeleteOrganizationHandler } from './application/use-cases/commands/organizations/delete-organization/delete-organization.handler';

// Application - Query Handlers
import { GetUserByIdHandler } from './application/use-cases/queries/users/get-user-by-id/get-user-by-id.handler';
import { GetUsersHandler } from './application/use-cases/queries/users/get-users/get-users.handler';
import { GetUserPermissionsHandler } from './application/use-cases/queries/users/get-user-permissions/get-user-permissions.handler';
import { GetRolesHandler } from './application/use-cases/queries/roles/get-roles/get-roles.handler';
import { GetRoleByIdHandler } from './application/use-cases/queries/roles/get-role-by-id/get-role-by-id.handler';
import { GetPermissionsHandler } from './application/use-cases/queries/permissions/get-permissions/get-permissions.handler';
import { GetPermissionByIdHandler } from './application/use-cases/queries/permissions/get-permission-by-id/get-permission-by-id.handler';
import { GetOrganizationsHandler } from './application/use-cases/queries/organizations/get-organizations/get-organizations.handler';
import { GetOrganizationByIdHandler } from './application/use-cases/queries/organizations/get-organization-by-id/get-organization-by-id.handler';
import { FindByUsernameOrEmailHandler } from './application/use-cases/queries/users/find-by-username-or-email/find-by-username-or-email.handler';

// Presentation
import { UsersController } from './presentation/controllers/users.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { OrganizationsController } from './presentation/controllers/organizations.controller';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';

// Shared
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { LogServiceName } from '@app/shared-constants';

const CommandHandlers = [
  // User Commands
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  AssignRolesHandler,
  AssignOrganizationsHandler,
  RemoveOrganizationsHandler,
  ActivateAccountHandler,
  // Role Commands
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
  AssignPermissionsHandler,
  RemovePermissionsHandler,
  // Permission Commands
  CreatePermissionHandler,
  UpdatePermissionHandler,
  DeletePermissionHandler,
  // Organization Commands
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
  DeleteOrganizationHandler,
];

const QueryHandlers = [
  GetUserByIdHandler,
  GetUsersHandler,
  GetUserPermissionsHandler,
  GetRolesHandler,
  GetRoleByIdHandler,
  GetPermissionsHandler,
  GetPermissionByIdHandler,
  GetOrganizationsHandler,
  GetOrganizationByIdHandler,
  FindByUsernameOrEmailHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    LoggerModule.forRoot(LogServiceName.IAM_SERVICE),
    CqrsModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-default-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    UsersController,
    RolesController,
    PermissionsController,
    OrganizationsController,
  ],
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
