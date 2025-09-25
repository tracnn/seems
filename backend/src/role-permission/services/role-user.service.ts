import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleUser } from "../entities/role-user.entity";
import { AssignRoleUserDto } from "../dto/assign-role-user.dto";

@Injectable()
export class RoleUserService {
  constructor(
    @InjectRepository(RoleUser)
    private readonly roleUserRepo: Repository<RoleUser>,
  ) {}

  async assignRole(dto: AssignRoleUserDto): Promise<RoleUser> {
    const entity = this.roleUserRepo.create(dto);
    return this.roleUserRepo.save(entity);
  }

  async findAll(): Promise<RoleUser[]> {
    return this.roleUserRepo.find();
  }

  async findById(id: string): Promise<RoleUser> {
    return this.roleUserRepo.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<any> {
    return await this.roleUserRepo.delete(id);
  }
}