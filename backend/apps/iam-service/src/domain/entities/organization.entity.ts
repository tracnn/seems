import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';
import { UserOrganization } from './user-organization.entity';

/**
 * Organization Entity - Represents organizational structure
 */
@Entity('IAM_ORGANIZATIONS')
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
    name: 'TYPE',
    length: 50,
    nullable: true,
  })
  type: string;

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

  @Column({
    name: 'ADDRESS',
    type: 'clob',
    nullable: true,
  })
  address: string;

  @Column({
    name: 'PHONE',
    length: 20,
    nullable: true,
  })
  phone: string;

  @Column({
    name: 'EMAIL',
    length: 100,
    nullable: true,
  })
  email: string;

  @Column({
    name: 'WEBSITE',
    length: 200,
    nullable: true,
  })
  website: string;

  // Note: isActive inherited from BaseEntity

  // Relationships
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'PARENT_ID' })
  parent: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];

  @OneToMany(() => UserOrganization, (userOrg) => userOrg.organization)
  userOrganizations: UserOrganization[];
}
