import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Role } from '../role-permission/entities/role.entity';
import { Permission } from '../role-permission/entities/permission.entity';
import { PermissionRole } from '../role-permission/entities/permission-role.entity';

export default class PermissionRoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    console.log('👉 Đang chạy PermissionRoleSeeder');

    const roleRepo = dataSource.getRepository(Role);
    const permissionRepo = dataSource.getRepository(Permission);
    const permissionRoleRepo = dataSource.getRepository(PermissionRole);

    //1. Lấy role "user"
    const userRole = await roleRepo.findOne({ where: { name: 'user' } });
    if (!userRole) {
      console.warn('⚠️ Role "user" chưa tồn tại');
      return;
    }

    // Các permission cần gán cho role "user"
    const permissionNamesUser = ['user:create', 'user:update', 'user:delete', 'user:read', 'access_menu_user'];

    const permissionsUser = await permissionRepo.find({
      where: permissionNamesUser.map(name => ({ name }))
    });

    for (const permission of permissionsUser) {
      const exists = await permissionRoleRepo.findOne({
        where: {
          roleId: userRole.id,
          permissionId: permission.id
        }
      });

      if (!exists) {
        await permissionRoleRepo.save(
          permissionRoleRepo.create({
            roleId: userRole.id,
            permissionId: permission.id
          })
        );
        console.log(`✅ Gán permission "${permission.name}" cho role "user"`);
      }
    }

    //2. Lấy role "appointment"
    const appointmentRole = await roleRepo.findOne({ where: { name: 'appointment' } });
    if (!appointmentRole) {
      console.warn('⚠️ Role "appointment" chưa tồn tại');
      return;
    }

    // Các permission cần gán cho role "appointment"
    const permissionNamesAppointment = ['appointment:create', 'appointment:update', 'appointment:delete', 'appointment:read', 'access_menu_appointment'];

    const permissionsAppointment = await permissionRepo.find({
      where: permissionNamesAppointment.map(name => ({ name }))
    });

    for (const permission of permissionsAppointment) {
      const exists = await permissionRoleRepo.findOne({
        where: {
          roleId: appointmentRole.id,
          permissionId: permission.id
        }
      });

      if (!exists) {
        await permissionRoleRepo.save(
          permissionRoleRepo.create({
            roleId: appointmentRole.id,
            permissionId: permission.id
          })
        );
        console.log(`✅ Gán permission "${permission.name}" cho role "appointment"`);
      }
    }

    //3. Lấy role "queue"

    const queueRole = await roleRepo.findOne({ where: { name: 'queue' } });
    if (!queueRole) {
      console.warn('⚠️ Role "queue" chưa tồn tại');
      return;
    }

    // Các permission cần gán cho role "queue"
    const permissionNamesQueue = ['queue:create', 'queue:update', 'queue:delete', 'queue:read', 'access_menu_queue'];

    const permissionsQueue = await permissionRepo.find({
      where: permissionNamesQueue.map(name => ({ name }))
    });

    for (const permission of permissionsQueue) {
      const exists = await permissionRoleRepo.findOne({
        where: {
          roleId: queueRole.id,
          permissionId: permission.id
        }
      });

      if (!exists) {
        await permissionRoleRepo.save(
          permissionRoleRepo.create({
            roleId: queueRole.id,
            permissionId: permission.id
          })
        );
        console.log(`✅ Gán permission "${permission.name}" cho role "queue"`);
      }
    }


    //4. Lấy role "survey"

    const surveyRole = await roleRepo.findOne({ where: { name: 'survey' } });
    if (!surveyRole) {
      console.warn('⚠️ Role "survey" chưa tồn tại');
      return;
    }

    // Các permission cần gán cho role "survey"
    const permissionNamesSurvey = ['survey:create', 'survey:update', 'survey:delete', 'survey:read', 'access_menu_survey'];

    const permissionsSurvey = await permissionRepo.find({
      where: permissionNamesSurvey.map(name => ({ name }))
    });

    for (const permission of permissionsSurvey) {
      const exists = await permissionRoleRepo.findOne({
        where: {
          roleId: surveyRole.id,
          permissionId: permission.id
        }
      });

      if (!exists) {
        await permissionRoleRepo.save(
          permissionRoleRepo.create({
            roleId: surveyRole.id,
            permissionId: permission.id
          })
        );
        console.log(`✅ Gán permission "${permission.name}" cho role "survey"`);
      }
    }

    //5. Lấy role "notification"

    const notificationRole = await roleRepo.findOne({ where: { name: 'notification' } });
    if (!notificationRole) {
      console.warn('⚠️ Role "notification" chưa tồn tại');
      return;
    }

    // Các permission cần gán cho role "notification"
    const permissionNamesNotification = ['notification:create', 'notification:update', 'notification:delete', 'notification:read', 'access_menu_notification'];

    const permissionsNotification = await permissionRepo.find({
      where: permissionNamesNotification.map(name => ({ name }))
    });

    for (const permission of permissionsNotification) {
      const exists = await permissionRoleRepo.findOne({
        where: {
          roleId: notificationRole.id,
          permissionId: permission.id
        }
      });

      if (!exists) {
        await permissionRoleRepo.save(
          permissionRoleRepo.create({
            roleId: notificationRole.id,
            permissionId: permission.id
          })
        );
        console.log(`✅ Gán permission "${permission.name}" cho role "notification"`);
      }
    }
  }
}