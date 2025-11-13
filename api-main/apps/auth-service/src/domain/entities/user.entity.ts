import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    name: 'username',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  username: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastName: string;

  @Column({
    name: 'is_active',
    type: 'number',
    default: 1,
  })
  isActive: number;

  @Column({
    name: 'is_email_verified',
    type: 'number',
    default: 0,
  })
  isEmailVerified: number;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt: Date | null;
}

