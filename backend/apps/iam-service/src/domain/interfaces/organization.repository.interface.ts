import { Organization } from '../entities/organization.entity';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findByCode(code: string): Promise<Organization | null>;
  findByName(name: string): Promise<Organization | null>;
  create(organization: Partial<Organization>): Promise<Organization>;
  update(
    id: string,
    organization: Partial<Organization>,
  ): Promise<Organization>;
  delete(id: string): Promise<void>;
  softDelete(id: string, deletedBy: string): Promise<void>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string;
    isActive?: boolean;
  }): Promise<{ data: Organization[]; total: number }>;
  findChildren(parentId: string): Promise<Organization[]>;
  findByParent(parentId: string): Promise<Organization[]>;
}
