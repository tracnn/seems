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
      { name: 'queue:create', displayName: 'Tạo hàng đợi', description: 'Tạo hàng đợi', type: PermissionType.API },
      { name: 'queue:update', displayName: 'Cập nhật hàng đợi', description: 'Cập nhật hàng đợi', type: PermissionType.API },
      { name: 'queue:delete', displayName: 'Xóa hàng đợi', description: 'Xóa hàng đợi', type: PermissionType.API },
      { name: 'queue:read', displayName: 'Xem hàng đợi', description: 'Xem hàng đợi', type: PermissionType.API },
      { name: 'access_menu_queue', displayName: 'Truy cập menu Hàng đợi', description: 'Truy cập menu Hàng đợi', type: PermissionType.MENU },
      { name: 'appointment:create', displayName: 'Tạo lịch khám bệnh', description: 'Tạo lịch khám bệnh', type: PermissionType.API },
      { name: 'appointment:update', displayName: 'Cập nhật lịch khám bệnh', description: 'Cập nhật lịch khám bệnh', type: PermissionType.API },
      { name: 'appointment:delete', displayName: 'Xóa lịch khám bệnh', description: 'Xóa lịch khám bệnh', type: PermissionType.API },
      { name: 'appointment:read', displayName: 'Xem lịch khám bệnh', description: 'Xem lịch khám bệnh', type: PermissionType.API },
      { name: 'access_menu_appointment', displayName: 'Truy cập menu Lịch khám bệnh', description: 'Truy cập menu Lịch khám bệnh', type: PermissionType.MENU },
      { name: 'survey:create', displayName: 'Tạo khảo sát', description: 'Tạo khảo sát', type: PermissionType.API },
      { name: 'survey:update', displayName: 'Cập nhật khảo sát', description: 'Cập nhật khảo sát', type: PermissionType.API },
      { name: 'survey:delete', displayName: 'Xóa khảo sát', description: 'Xóa khảo sát', type: PermissionType.API },
      { name: 'survey:read', displayName: 'Xem khảo sát', description: 'Xem khảo sát', type: PermissionType.API },
      { name: 'access_menu_survey', displayName: 'Truy cập menu Khảo sát', description: 'Truy cập menu Khảo sát', type: PermissionType.MENU },
      { name: 'notification:create', displayName: 'Tạo thông báo', description: 'Tạo thông báo', type: PermissionType.API },
      { name: 'notification:read', displayName: 'Xem thông báo', description: 'Xem thông báo', type: PermissionType.API },
      { name: 'notification:update', displayName: 'Cập nhật thông báo', description: 'Cập nhật thông báo', type: PermissionType.API },
      { name: 'notification:delete', displayName: 'Xóa thông báo', description: 'Xóa thông báo', type: PermissionType.API },
      { name: 'access_menu_notification', displayName: 'Truy cập menu Thông báo', description: 'Truy cập menu Thông báo', type: PermissionType.MENU },
    ];

    for (const permission of permissions) {
      const exists = await repo.findOne({ where: { name: permission.name } });
      if (!exists) {
        await repo.save(repo.create(permission));
      }
    }
  }
}