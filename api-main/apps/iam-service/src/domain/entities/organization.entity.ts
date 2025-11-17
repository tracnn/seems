import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';
import { UserOrganization } from './user-organization.entity';

/**
 * Organization Entity - Represents organizational structure
 */
@Entity('ORGANIZATIONS')
export class Organization extends BaseEntity {
  @Column({
    name: 'NAME',
    length: 200,
  })
  name: string;

  @Column({
    name: 'CODE',
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    name: 'PARENT_ID',
    length: 36,
    nullable: true,
  })
  parentId: string;

  @Column({
    name: 'LEVEL',
    type: 'number',
    default: 0,
  })
  level: number;

  @Column({
    name: 'PATH',
    length: 1000,
    nullable: true,
  })
  path: string;

  @Column({
    name: 'DESCRIPTION',
    length: 1000,
    nullable: true,
  })
  description: string;

  // Relationships
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'PARENT_ID' })
  parent: Organization;

  @OneToMany(() => Organization, org => org.parent)
  children: Organization[];

  @OneToMany(() => UserOrganization, userOrg => userOrg.organization)
  userOrganizations: UserOrganization[];
}

