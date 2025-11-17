import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/common';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

/**
 * Role Entity - Represents user roles in the system
 */
@Entity('ROLES')
export class Role extends BaseEntity {
  @Column({
    name: 'NAME',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    name: 'CODE',
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    name: 'DESCRIPTION',
    length: 500,
    nullable: true,
  })
  description: string;

  @Column({
    name: 'LEVEL',
    type: 'number',
    default: 0,
  })
  level: number;

  // Relationships
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];
}

