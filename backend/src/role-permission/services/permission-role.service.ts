import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PermissionRole } from "../entities/permission-role.entity";
import { AssignPermissionRoleDto } from "../dto/assign-permission-role.dto";

@Injectable()
export class PermissionRoleService {
  constructor(
    @InjectRepository(PermissionRole)
    private readonly permissionRoleRepo: Repository<PermissionRole>,
  ) {}

  async assignRole(dto: AssignPermissionRoleDto): Promise<PermissionRole> {
    const entity = this.permissionRoleRepo.create(dto);
    return this.permissionRoleRepo.save(entity);
  }

  async findAll(): Promise<PermissionRole[]> {
    return this.permissionRoleRepo.find();
  }

  async findById(id: string): Promise<PermissionRole> {
    return this.permissionRoleRepo.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<any> {
    return await this.permissionRoleRepo.delete(id);
  }
}