import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/common';
import { UserRole } from './user-role.entity';
import { UserOrganization } from './user-organization.entity';

/**
 * User Entity - Master entity for IAM Service
 * This is the single source of truth for user data
 */
@Entity('USERS')
export class User extends BaseEntity {
  @Column({
    name: 'USERNAME',
    length: 100,
    unique: true,
  })
  username: string;

  @Column({
    name: 'EMAIL',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    name: 'PASSWORD',
    length: 255,
  })
  password: string;

  @Column({
    name: 'FIRST_NAME',
    length: 100,
    nullable: true,
  })
  firstName: string;

  @Column({
    name: 'LAST_NAME',
    length: 100,
    nullable: true,
  })
  lastName: string;

  @Column({
    name: 'PHONE',
    length: 20,
    nullable: true,
  })
  phone: string;

  @Column({
    name: 'AVATAR_URL',
    length: 500,
    nullable: true,
  })
  avatarUrl: string;

  @Column({
    name: 'IS_EMAIL_VERIFIED',
    default: false,
  })
  isEmailVerified: boolean;

  @Column({
    name: 'LAST_LOGIN_AT',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt: Date;

  // Relationships
  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => UserOrganization, userOrg => userOrg.user)
  userOrganizations: UserOrganization[];
}

