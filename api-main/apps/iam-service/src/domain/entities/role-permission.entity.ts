import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

/**
 * RolePermission Entity - Many-to-many relationship between Role and Permission
 */
@Entity('IAM_ROLE_PERMISSIONS')
export class RolePermission extends BaseEntity {
  @Column({
    name: 'ROLE_ID',
    length: 36,
  })
  roleId: string;

  @Column({
    name: 'PERMISSION_ID',
    length: 36,
  })
  permissionId: string;

  @Column({
    name: 'GRANTED_BY',
    length: 100,
    nullable: true,
  })
  grantedBy: string;

  @Column({
    name: 'GRANTED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  grantedAt: Date;

  // Relationships
  @ManyToOne(() => Role, role => role.rolePermissions)
  @JoinColumn({ name: 'ROLE_ID' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions)
  @JoinColumn({ name: 'PERMISSION_ID' })
  permission: Permission;
}

