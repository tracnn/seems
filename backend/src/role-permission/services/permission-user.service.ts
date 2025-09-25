import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PermissionRole } from "../entities/permission-role.entity";
import { AssignPermissionRoleDto } from "../dto/assign-permission-role.dto";
import { PermissionUser } from "../entities/permission-user.entity";
import { AssignPermissionUserDto } from "../dto/assign-permission-user.dto";

@Injectable()
export class PermissionUserService {
  constructor(
    @InjectRepository(PermissionUser)
    private readonly permissionUserRepo: Repository<PermissionUser>,
  ) {}

  async assignRole(dto: AssignPermissionUserDto): Promise<PermissionUser> {
    const entity = this.permissionUserRepo.create(dto);
    return this.permissionUserRepo.save(entity);
  }

  async findAll(): Promise<PermissionUser[]> {
    return this.permissionUserRepo.find();
  }

  async findById(id: string): Promise<PermissionUser> {
    return this.permissionUserRepo.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<any> {
    return await this.permissionUserRepo.delete(id);
  }
}