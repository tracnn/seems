import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/common';
import { RolePermission } from './role-permission.entity';

/**
 * Permission Entity - Represents granular permissions
 */
@Entity('IAM_PERMISSIONS')
export class Permission extends BaseEntity {
  @Column({
    name: 'NAME',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    name: 'CODE',
    length: 100,
    unique: true,
  })
  code: string;

  @Column({
    name: 'RESOURCE',
    length: 50,
  })
  resource: string;

  @Column({
    name: 'ACTION',
    length: 50,
  })
  action: string;

  @Column({
    name: 'DESCRIPTION',
    length: 500,
    nullable: true,
  })
  description: string;

  // Relationships
  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];
}

