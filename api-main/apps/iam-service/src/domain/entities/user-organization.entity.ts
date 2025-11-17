import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';
import { User } from './user.entity';
import { Organization } from './organization.entity';

/**
 * UserOrganization Entity - Many-to-many relationship between User and Organization
 * A user can belong to multiple organizations with different roles
 */
@Entity('USER_ORGANIZATIONS')
export class UserOrganization extends BaseEntity {
  @Column({
    name: 'USER_ID',
    length: 36,
  })
  userId: string;

  @Column({
    name: 'ORGANIZATION_ID',
    length: 36,
  })
  organizationId: string;

  @Column({
    name: 'ROLE_IN_ORG',
    length: 50,
    nullable: true,
    comment: 'Role in this organization (e.g., STAFF, PATIENT, DOCTOR, ADMIN)',
  })
  roleInOrg: string;

  @Column({
    name: 'JOINED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({
    name: 'LEFT_AT',
    type: 'timestamp',
    nullable: true,
  })
  leftAt: Date;

  @Column({
    name: 'IS_PRIMARY',
    default: false,
    comment: 'Is this the primary organization for this user',
  })
  isPrimary: boolean;

  @Column({
    name: 'ASSIGNED_BY',
    length: 100,
    nullable: true,
  })
  assignedBy: string;

  // Relationships
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'ORGANIZATION_ID' })
  organization: Organization;
}

