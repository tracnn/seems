import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Permission } from '../role-permission/entities/permission.entity';
import { PermissionType } from '../role-permission/enums/permission.enum';

export default class PermissionSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Permission);

    const permissions = [
      { name: 'user:create', displayName: 'Tạo người dùng', description: 'Tạo người dùng', type: PermissionType.API },
      { name: 'user:update', displayName: 'Cập nhật người dùng', description: 'Cập nhật người dùng', type: PermissionType.API },
      { name: 'user:delete', displayName: 'Xóa người dùng', description: 'Xóa người dùng', type: PermissionType.API },
      { name: 'user:read', displayName: 'Xem người dùng', description: 'Xem người dùng', type: PermissionType.API },
      { name: 'access_menu_user', displayName: 'Truy cập menu Người dùng', description: 'Truy cập menu Người dùng', type: PermissionType.MENU },
      { name: 'dashboard:read', displayName: 'Xem dashboard', description: 'Xem dashboard', type: PermissionType.API },
      { name: 'access_menu_dashboard', displayName: 'Truy cập menu Dashboard', description: 'Truy cập menu Dashboard', type: PermissionType.MENU },
    ];

    for (const permission of permissions) {
      const exists = await repo.findOne({ where: { name: permission.name } });
      if (!exists) {
        await repo.save(repo.create(permission));
      }
    }
  }
}