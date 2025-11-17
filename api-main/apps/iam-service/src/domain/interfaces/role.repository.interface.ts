import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByIdWithPermissions(id: string): Promise<Role | null>;
  findByCode(code: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(role: Partial<Role>): Promise<Role>;
  update(id: string, role: Partial<Role>): Promise<Role>;
  delete(id: string): Promise<void>;
  softDelete(id: string, deletedBy: string): Promise<void>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: Role[]; total: number }>;
}

