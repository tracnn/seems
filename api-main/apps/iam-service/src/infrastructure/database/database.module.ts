import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';

// Entities
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { UserRole } from '../../domain/entities/user-role.entity';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { Organization } from '../../domain/entities/organization.entity';
import { UserOrganization } from '../../domain/entities/user-organization.entity';

// Repositories
import { UserRepository } from './typeorm/repositories/user.repository';
import { RoleRepository } from './typeorm/repositories/role.repository';
import { PermissionRepository } from './typeorm/repositories/permission.repository';
import { UserRoleRepository } from './typeorm/repositories/user-role.repository';
import { RolePermissionRepository } from './typeorm/repositories/role-permission.repository';
import { OrganizationRepository } from './typeorm/repositories/organization.repository';
import { UserOrganizationRepository } from './typeorm/repositories/user-organization.repository';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return config;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
      Organization,
      UserOrganization,
    ]),
  ],
  providers: [
    UserRepository,
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    RolePermissionRepository,
    OrganizationRepository,
    UserOrganizationRepository,
    // Provide with interface tokens
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
    {
      provide: 'IUserRoleRepository',
      useClass: UserRoleRepository,
    },
    {
      provide: 'IRolePermissionRepository',
      useClass: RolePermissionRepository,
    },
    {
      provide: 'IOrganizationRepository',
      useClass: OrganizationRepository,
    },
    {
      provide: 'IUserOrganizationRepository',
      useClass: UserOrganizationRepository,
    },
  ],
  exports: [
    UserRepository,
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    RolePermissionRepository,
    OrganizationRepository,
    UserOrganizationRepository,
    'IUserRepository',
    'IRoleRepository',
    'IPermissionRepository',
    'IUserRoleRepository',
    'IRolePermissionRepository',
    'IOrganizationRepository',
    'IUserOrganizationRepository',
    TypeOrmModule,
  ],
})
export class DatabaseModule {}

