import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Role } from '../role-permission/entities/role.entity';
import { Permission } from '../role-permission/entities/permission.entity';
import { PermissionRole } from '../role-permission/entities/permission-role.entity';

export default class PermissionRoleSuperAdminSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    console.log('👉 Đang chạy PermissionRoleSuperAdminSeeder');

    const roleRepo = dataSource.getRepository(Role);
    const permissionRepo = dataSource.getRepository(Permission);
    const permissionRoleRepo = dataSource.getRepository(PermissionRole);

    // Lấy role super_admin
    const superAdminRole = await roleRepo.findOne({ where: { name: 'super_admin' } });
    if (!superAdminRole) {
      console.warn('❌ Không tìm thấy role "super_admin"');
      return;
    }

    // Lấy toàn bộ permissions
    const allPermissions = await permissionRepo.find();

    for (const permission of allPermissions) {
      const exists = await permissionRoleRepo.findOne({
        where: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      });

      if (!exists) {
        await permissionRoleRepo.save(
          permissionRoleRepo.create({
            roleId: superAdminRole.id,
            permissionId: permission.id
          })
        );
        console.log(`✅ Gán ${permission.name} cho super_admin`);
      }
    }
  }
}