import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserOrganization } from '../../../../domain/entities/user-organization.entity';
import { IUserOrganizationRepository } from '../../../../domain/interfaces/user-organization.repository.interface';

@Injectable()
export class UserOrganizationRepository implements IUserOrganizationRepository {
  constructor(
    @InjectRepository(UserOrganization)
    private readonly repository: Repository<UserOrganization>,
  ) {}

  async findById(id: string): Promise<UserOrganization | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user', 'organization'],
    });
  }

  async findByUserId(userId: string): Promise<UserOrganization[]> {
    return await this.repository.find({
      where: { userId, deletedAt: IsNull() },
      relations: ['organization'],
      order: { isPrimary: 'DESC', joinedAt: 'DESC' },
    });
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<UserOrganization[]> {
    return await this.repository.find({
      where: { organizationId, deletedAt: IsNull() },
      relations: ['user'],
      order: { joinedAt: 'DESC' },
    });
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<UserOrganization | null> {
    return await this.repository.findOne({
      where: { userId, organizationId, deletedAt: IsNull() },
    });
  }

  async findPrimaryOrganization(
    userId: string,
  ): Promise<UserOrganization | null> {
    return await this.repository.findOne({
      where: { userId, isPrimary: true, deletedAt: IsNull() },
      relations: ['organization'],
    });
  }

  async assignUserToOrganization(
    userOrganization: Partial<UserOrganization>,
  ): Promise<UserOrganization> {
    const newUserOrg = this.repository.create(userOrganization);
    return await this.repository.save(newUserOrg);
  }

  async removeUserFromOrganization(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async removeByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    await this.repository.delete({ userId, organizationId });
  }

  async removeAllUserOrganizations(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async setPrimaryOrganization(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    // Remove primary flag from all user's organizations
    await this.repository.update({ userId }, { isPrimary: false });

    // Set new primary organization
    await this.repository.update(
      { userId, organizationId },
      { isPrimary: true },
    );
  }

  async bulkAssignUsersToOrganization(
    userOrganizations: Partial<UserOrganization>[],
  ): Promise<UserOrganization[]> {
    const entities = userOrganizations.map((uo) => this.repository.create(uo));
    return await this.repository.save(entities);
  }

  async findActiveByUserId(userId: string): Promise<UserOrganization[]> {
    return await this.repository
      .createQueryBuilder('userOrg')
      .where('userOrg.userId = :userId', { userId })
      .andWhere('userOrg.deletedAt IS NULL')
      .andWhere('userOrg.isActive = :isActive', { isActive: true })
      .andWhere('(userOrg.leftAt IS NULL OR userOrg.leftAt > :now)', {
        now: new Date(),
      })
      .leftJoinAndSelect('userOrg.organization', 'organization')
      .orderBy('userOrg.isPrimary', 'DESC')
      .addOrderBy('userOrg.joinedAt', 'DESC')
      .getMany();
  }
}
