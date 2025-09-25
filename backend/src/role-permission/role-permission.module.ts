import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionController } from './role-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleUser } from './entities/role-user.entity';
import { PermissionRole } from './entities/permission-role.entity';
import { PermissionUser } from './entities/permission-user.entity';
import { Permission } from './entities/permission.entity';
import { GetUserPermissionsHandler } from './queries/get-user-permissions.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { Role } from './entities/role.entity';
import { BASE_SCHEMA } from '../constants/common.constant';
import { PermissionService } from './services/permission.service';
import { PermissionController } from './permission.controller';
import { RoleController } from './role.controller';
import { RoleService } from './services/role.service';
import { RoleUserService } from './services/role-user.service';
import { RoleUserController } from './role-user.controller';
import { PermissionRoleController } from './permission-role.controller';
import { PermissionRoleService } from './services/permission-role.service';
import { PermissionUserController } from './permission-user.controller';
import { PermissionUserService } from './services/permission-user.service';

const CommandHandlers = [
  GetUserPermissionsHandler,
];


@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([RoleUser, PermissionRole, PermissionUser, Permission, Role], BASE_SCHEMA.DEFAULT),
  ],
  controllers: [
    RolePermissionController, 
    PermissionController, 
    RoleController, 
    RoleUserController,
    PermissionRoleController,
    PermissionUserController,
  ],
  providers: [
    RolePermissionService,
    PermissionService,
    RoleService,
    RoleUserService,
    PermissionRoleService,
    PermissionUserService,
    ...CommandHandlers,
  ],
  exports: [CqrsModule, PermissionService],
})
export class RolePermissionModule {}
