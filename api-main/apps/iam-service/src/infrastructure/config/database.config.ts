import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { UserRole } from '../../domain/entities/user-role.entity';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { Organization } from '../../domain/entities/organization.entity';
import { UserOrganization } from '../../domain/entities/user-organization.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'oracle',
    host: process.env.DB_IAM_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(
      process.env.DB_IAM_PORT || process.env.DB_PORT || '1521',
      10,
    ),
    username: process.env.DB_IAM_USERNAME || process.env.DB_USERNAME || '',
    password: process.env.DB_IAM_PASSWORD || process.env.DB_PASSWORD || '',
    serviceName:
      process.env.DB_IAM_SERVICE_NAME || process.env.DB_SERVICE_NAME || 'XE',
    // Import entities trực tiếp
    entities: [
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
      Organization,
      UserOrganization,
    ],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
    extra: {
      poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
      poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
      poolIncrement: parseInt(process.env.DB_POOL_INCREMENT || '2', 10),
      connectTimeout: 60000,
      poolTimeout: 60000,
      queueTimeout: 60000,
      poolPingInterval: 60,
      stmtCacheSize: 30,
      enableConnectionValidation: true,
    },
  }),
);
