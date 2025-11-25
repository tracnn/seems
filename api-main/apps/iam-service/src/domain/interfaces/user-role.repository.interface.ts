import { UserRole } from '../entities/user-role.entity';

export interface IUserRoleRepository {
  findById(id: string): Promise<UserRole | null>;
  findByUserId(userId: string): Promise<UserRole[]>;
  findByRoleId(roleId: string): Promise<UserRole[]>;
  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null>;
  assignRole(userRole: Partial<UserRole>): Promise<UserRole>;
  removeRole(id: string): Promise<void>;
  removeByUserAndRole(userId: string, roleId: string): Promise<void>;
  removeAllUserRoles(userId: string): Promise<void>;
  bulkAssignRoles(userRoles: Partial<UserRole>[]): Promise<UserRole[]>;
}
