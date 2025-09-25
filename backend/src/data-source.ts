import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { DataSource } from "typeorm";
import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

import { Qd3176Xml1s } from './bhxh/qd3176/entities/qd3176-xml1s.entity';
import { Qd3176Xml2s } from './bhxh/qd3176/entities/qd3176-xml2s.entity';
import { Qd3176Xml3s } from './bhxh/qd3176/entities/qd3176-xml3s.entity';
import { Qd3176Xml4s } from './bhxh/qd3176/entities/qd3176-xml4s.entity';
import { Qd3176Xml5s } from './bhxh/qd3176/entities/qd3176-xml5s.entity';
import { Qd3176Xml6s } from './bhxh/qd3176/entities/qd3176-xml6s.entity';
import { Qd3176Xml7s } from './bhxh/qd3176/entities/qd3176-xml7s.entity';
import { Qd3176Xml8s } from './bhxh/qd3176/entities/qd3176-xml8s.entity';
import { Qd3176Xml9s } from './bhxh/qd3176/entities/qd3176-xml9s.entity';
import { Qd3176Xml10s } from './bhxh/qd3176/entities/qd3176-xml10s.entity';
import { Qd3176Xml11s } from './bhxh/qd3176/entities/qd3176-xml11s.entity';
import { Qd3176Xml12s } from './bhxh/qd3176/entities/qd3176-xml12s.entity';
import { Qd3176Xml13s } from './bhxh/qd3176/entities/qd3176-xml13s.entity';
import { Qd3176Xml14s } from './bhxh/qd3176/entities/qd3176-xml14s.entity';
import { Qd3176Xml15s } from './bhxh/qd3176/entities/qd3176-xml15s.entity';
import { User } from './user/entities/user.entity';
import { RoleUser } from './role-permission/entities/role-user.entity';
import { PermissionUser } from './role-permission/entities/permission-user.entity';
import { PermissionRole } from './role-permission/entities/permission-role.entity';
import { Role } from './role-permission/entities/role.entity';
import { Permission } from './role-permission/entities/permission.entity';
import RoleSeeder from './seeders/role.seeder';
import PermissionSeeder from './seeders/permission.seeder';
import PermissionRoleSeeder from './seeders/permission-role.seeder';
import PermissionRoleSuperAdminSeeder from './seeders/permission-role-super-admin.seeder';

const options: DataSourceOptions & SeederOptions = {
    type: 'oracle',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 1521,
    username: process.env.DB_USERNAME || 'XML_RS',
    password: process.env.DB_PASSWORD || 'XML_RS',
    serviceName: process.env.DB_SERVICE_NAME || 'FREEPDB1',
    entities: [
      Qd3176Xml1s, Qd3176Xml2s, Qd3176Xml3s, Qd3176Xml4s, Qd3176Xml5s, Qd3176Xml6s,
      Qd3176Xml7s, Qd3176Xml8s, Qd3176Xml9s, Qd3176Xml10s, Qd3176Xml11s,
      Qd3176Xml12s, Qd3176Xml13s, Qd3176Xml14s, Qd3176Xml15s,
      RoleUser, PermissionUser, PermissionRole, Role, Permission, User,
    ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    migrationsTableName: 'MIGRATIONS',
    synchronize: false,
    seeds: [RoleSeeder, PermissionSeeder, PermissionRoleSeeder, PermissionRoleSuperAdminSeeder],
  };
  
  export default new DataSource(options);