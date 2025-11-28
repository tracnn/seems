import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Permission } from '../../../domain/entities/permission.entity';
import { Role } from '../../../domain/entities/role.entity';
import { RolePermission } from '../../../domain/entities/role-permission.entity';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/entities/user-role.entity';
import { UserOrganization } from '../../../domain/entities/user-organization.entity';
import { DEFAULT_PERMISSIONS } from '../../../domain/constants/permissions.constants';
import { DEFAULT_ROLES } from '../../../domain/constants/roles.constants';

// Load environment variables
config();

async function seed() {
  console.log('🌱 Starting IAM Service seed...');

  const dataSource = new DataSource({
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
    entities: [
      Permission,
      Role,
      RolePermission,
      User,
      UserRole,
      UserOrganization,
    ],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const permissionRepo = dataSource.getRepository(Permission);
    const roleRepo = dataSource.getRepository(Role);
    const rolePermissionRepo = dataSource.getRepository(RolePermission);
    const userRepo = dataSource.getRepository(User);
    const userRoleRepo = dataSource.getRepository(UserRole);

    // 1. Seed Permissions
    console.log('📝 Seeding permissions...');
    const permissionMap = new Map<string, Permission>();

    for (const permData of DEFAULT_PERMISSIONS) {
      let permission = await permissionRepo.findOne({
        where: { code: permData.code },
      });

      if (!permission) {
        permission = permissionRepo.create({
          ...permData,
          createdBy: 'system',
          isActive: true,
        });
        await permissionRepo.save(permission);
        console.log(`  ✓ Created permission: ${permData.code}`);
      } else {
        console.log(`  ○ Permission exists: ${permData.code}`);
      }

      permissionMap.set(permData.code, permission);
    }

    // 2. Seed Roles
    console.log('👥 Seeding roles...');
    const roleMap = new Map<string, Role>();

    for (const roleData of DEFAULT_ROLES) {
      let role = await roleRepo.findOne({
        where: { code: roleData.code },
      });

      if (!role) {
        role = roleRepo.create({
          code: roleData.code,
          name: roleData.name,
          description: roleData.description,
          level: roleData.level,
          createdBy: 'system',
          isActive: true,
        });
        await roleRepo.save(role);
        console.log(`  ✓ Created role: ${roleData.code}`);
      } else {
        console.log(`  ○ Role exists: ${roleData.code}`);
      }

      roleMap.set(roleData.code, role);
    }

    // 3. Assign Permissions to Roles
    console.log('🔗 Assigning permissions to roles...');

    for (const roleData of DEFAULT_ROLES) {
      const role = roleMap.get(roleData.code);
      if (!role) continue;

      // Check if role already has permissions
      const existingPermissions = await rolePermissionRepo.count({
        where: { roleId: role.id },
      });

      if (existingPermissions > 0) {
        console.log(`  ○ Role ${roleData.code} already has permissions`);
        continue;
      }

      // Handle wildcard permission for SUPER_ADMIN
      if (roleData.permissions.includes('*')) {
        // Assign all permissions
        for (const [code, permission] of permissionMap) {
          const rolePermission = rolePermissionRepo.create({
            roleId: role.id,
            permissionId: permission.id,
            grantedBy: 'system',
            createdBy: 'system',
            isActive: true,
          });
          await rolePermissionRepo.save(rolePermission);
        }
        console.log(`  ✓ Assigned all permissions to ${roleData.code}`);
      } else {
        // Assign specific permissions
        for (const permCode of roleData.permissions) {
          const permission = permissionMap.get(permCode);
          if (!permission) {
            console.log(`  ⚠ Permission not found: ${permCode}`);
            continue;
          }

          const rolePermission = rolePermissionRepo.create({
            roleId: role.id,
            permissionId: permission.id,
            grantedBy: 'system',
            createdBy: 'system',
            isActive: true,
          });
          await rolePermissionRepo.save(rolePermission);
        }
        console.log(
          `  ✓ Assigned ${roleData.permissions.length} permissions to ${roleData.code}`,
        );
      }
    }

    // 4. Create Super Admin User
    console.log('👤 Creating super admin user...');

    const existingAdmin = await userRepo.findOne({
      where: { username: 'admin' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const adminUser = userRepo.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isEmailVerified: true,
        isActive: true,
        createdBy: 'system',
      });
      await userRepo.save(adminUser);

      // Assign SUPER_ADMIN role
      const superAdminRole = roleMap.get('SUPER_ADMIN');
      if (superAdminRole) {
        const userRole = userRoleRepo.create({
          userId: adminUser.id,
          roleId: superAdminRole.id,
          assignedBy: 'system',
          createdBy: 'system',
          isActive: true,
        });
        await userRoleRepo.save(userRole);
        console.log(
          '  ✓ Created super admin user (username: admin, password: Admin@123)',
        );
      }
    } else {
      console.log('  ○ Admin user already exists');
    }

    console.log('✨ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Permissions: ${permissionMap.size}`);
    console.log(`  - Roles: ${roleMap.size}`);
    console.log(
      `  - Super Admin: ${existingAdmin ? 'Already exists' : 'Created'}`,
    );
    console.log('\n🔐 Login credentials:');
    console.log('  Username: admin');
    console.log('  Password: Admin@123');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(console.error);
