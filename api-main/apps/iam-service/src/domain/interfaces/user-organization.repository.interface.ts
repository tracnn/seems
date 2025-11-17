import { UserOrganization } from '../entities/user-organization.entity';

export interface IUserOrganizationRepository {
  findById(id: string): Promise<UserOrganization | null>;
  findByUserId(userId: string): Promise<UserOrganization[]>;
  findByOrganizationId(organizationId: string): Promise<UserOrganization[]>;
  findByUserAndOrganization(userId: string, organizationId: string): Promise<UserOrganization | null>;
  findPrimaryOrganization(userId: string): Promise<UserOrganization | null>;
  
  assignUserToOrganization(userOrganization: Partial<UserOrganization>): Promise<UserOrganization>;
  removeUserFromOrganization(id: string): Promise<void>;
  removeByUserAndOrganization(userId: string, organizationId: string): Promise<void>;
  removeAllUserOrganizations(userId: string): Promise<void>;
  
  setPrimaryOrganization(userId: string, organizationId: string): Promise<void>;
  bulkAssignUsersToOrganization(userOrganizations: Partial<UserOrganization>[]): Promise<UserOrganization[]>;
  
  findActiveByUserId(userId: string): Promise<UserOrganization[]>;
}

