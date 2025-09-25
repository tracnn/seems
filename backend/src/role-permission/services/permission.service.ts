import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetUserPermissionsQuery } from "../queries/get-user-permissions.query";
import { CreatePermissionDto } from "../dto/create-permission.dto";
import { UpdatePermissionDto } from "../dto/update-permission.dto";
import { Permission } from "../entities/permission.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PermissionService {
  constructor(
    private readonly queryBus: QueryBus,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async getAllPermissions(userId: number): Promise<string[]> {
    return this.queryBus.execute(new GetUserPermissionsQuery(userId));
  }

  async can(userId: number, permission: string): Promise<boolean> {
    const perms = await this.getAllPermissions(userId);
    return perms.includes(permission);
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const entity = this.permissionRepo.create(dto);
    return this.permissionRepo.save(entity);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Permission> {
    return this.permissionRepo.findOneOrFail({ where: { id } });
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findById(id);
    Object.assign(permission, dto);
    return this.permissionRepo.save(permission);
  }

  async remove(id: string): Promise<any> {
    return await this.permissionRepo.update(id, { isActive: false });
  }
}