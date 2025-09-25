import { InjectRepository } from "@nestjs/typeorm";
import { GetUserPermissionsQuery } from "./get-user-permissions.query";
import { In, Repository } from "typeorm";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleUser } from "../entities/role-user.entity";
import { PermissionRole } from "../entities/permission-role.entity";
import { PermissionUser } from "../entities/permission-user.entity";
import { Permission } from "../entities/permission.entity";

@QueryHandler(GetUserPermissionsQuery)
export class GetUserPermissionsHandler implements IQueryHandler<GetUserPermissionsQuery> {
  constructor(
    @InjectRepository(RoleUser) private readonly roleUserRepo: Repository<RoleUser>,
    @InjectRepository(PermissionRole) private readonly permissionRoleRepo: Repository<PermissionRole>,
    @InjectRepository(PermissionUser) private readonly permissionUserRepo: Repository<PermissionUser>,
    @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
  ) {}

  async execute(query: GetUserPermissionsQuery): Promise<string[]> {
    const { userId } = query;

    // 1. Lấy các role của user
    const roleUsers = await this.roleUserRepo.find({
      where: { userId, isActive: true },
    });
    const roleIds = roleUsers.map(ru => ru.roleId);

    // 2. Lấy permission từ roles
    const permissionRoles = await this.permissionRoleRepo.find({
      where: { roleId: In(roleIds), isActive: true },
    });
    const permissionFromRoles = permissionRoles.map(pr => pr.permissionId);

    // 3. Lấy permission từ trực tiếp user
    const permissionUsers = await this.permissionUserRepo.find({
      where: { userId, isActive: true },
    });
    const permissionFromUser = permissionUsers.map(pu => pu.permissionId);

    // 4. Tổng hợp tất cả permissionId
    const permissionIds = [...new Set([...permissionFromRoles, ...permissionFromUser])];

    // 5. Truy vấn tên quyền
    const permissions = await this.permissionRepo.find({
      where: { id: In(permissionIds), isActive: true },
    });

    return permissions.map(p => p.name);
  }
}