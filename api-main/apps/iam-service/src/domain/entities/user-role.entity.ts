import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';
import { User } from './user.entity';
import { Role } from './role.entity';

/**
 * UserRole Entity - Many-to-many relationship between User and Role
 */
@Entity('USER_ROLES')
export class UserRole extends BaseEntity {
  @Column({
    name: 'USER_ID',
    length: 36,
  })
  userId: string;

  @Column({
    name: 'ROLE_ID',
    length: 36,
  })
  roleId: string;

  @Column({
    name: 'ASSIGNED_BY',
    length: 100,
    nullable: true,
  })
  assignedBy: string;

  @Column({
    name: 'ASSIGNED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignedAt: Date;

  @Column({
    name: 'EXPIRES_AT',
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.userRoles)
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @ManyToOne(() => Role, role => role.userRoles)
  @JoinColumn({ name: 'ROLE_ID' })
  role: Role;
}

