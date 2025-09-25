import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Role } from '../role-permission/entities/role.entity';

export default class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Role);

    const roles = [
      { name: 'super_admin', displayName: 'Quản trị toàn hệ thống', description: 'Quản trị toàn hệ thống' },
      { name: 'admin', displayName: 'Quản trị hệ thống', description: 'Quản trị hệ thống' },
      { name: 'appointment', displayName: 'Quản lý lịch hẹn', description: 'Quản lý lịch hẹn' },
      { name: 'user', displayName: 'Quản lý người dùng', description: 'Quản lý người dùng' },
      { name: 'queue', displayName: 'Quản lý hàng đợi', description: 'Quản lý hàng đợi' },
      { name: 'survey', displayName: 'Quản lý khảo sát', description: 'Quản lý khảo sát' },
      { name: 'notification', displayName: 'Quản lý thông báo', description: 'Quản lý thông báo' },
    ];

    for (const role of roles) {
      const exists = await repo.findOne({ where: { name: role.name } });
      if (!exists) {
        await repo.save(repo.create(role));
      }
    }
  }
}