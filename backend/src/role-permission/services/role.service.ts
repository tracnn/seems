import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "../entities/role.entity";
import { CreateRoleDto } from "../dto/create-role.dto";
import { UpdateRoleDto } from "../dto/update-role.dto";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const entity = this.roleRepo.create(dto);
    return this.roleRepo.save(entity);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Role> {
    return this.roleRepo.findOneOrFail({ where: { id } });
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async remove(id: string): Promise<any> {
    return await this.roleRepo.update(id, { isActive: false });
  }
}