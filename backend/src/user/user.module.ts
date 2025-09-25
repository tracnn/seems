import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UpdateUserHandler, DeleteUserHandler } from './commands/handlers/user-command.service';
import { BASE_SCHEMA } from '../constants/common.constant';
import { CreateUserHandler } from './commands/create-user.handler';
import { AuthModule } from '../auth/auth.module';
import { UpdateUserActiveStatusHandler } from './commands/update-user-active-status.handler';
import { ChangePasswordHandler } from './commands/change-password.handler';
import { SyncUsersToMeilisearchHandler } from './commands/sync-users-to-meilisearch.handler';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';
import { RolePermissionModule } from '../role-permission/role-permission.module';

const CommandHandlers = [
  ChangePasswordHandler,
  SyncUsersToMeilisearchHandler,
];


@Module({
  imports: [
    TypeOrmModule.forFeature([User], BASE_SCHEMA.DEFAULT), 
    CqrsModule,
    AuthModule,
    MeilisearchModule,
    RolePermissionModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    CreateUserHandler,
    UpdateUserActiveStatusHandler,
    ...CommandHandlers,
  ],
  exports: [CqrsModule, UserService],
})
export class UserModule { }
