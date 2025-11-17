import { Permission } from '../entities/permission.entity';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByCode(code: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  create(permission: Partial<Permission>): Promise<Permission>;
  update(id: string, permission: Partial<Permission>): Promise<Permission>;
  delete(id: string): Promise<void>;
  softDelete(id: string, deletedBy: string): Promise<void>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    resource?: string;
    action?: string;
    isActive?: boolean;
  }): Promise<{ data: Permission[]; total: number }>;
  findByCodes(codes: string[]): Promise<Permission[]>;
  bulkCreate(permissions: Partial<Permission>[]): Promise<Permission[]>;
}

