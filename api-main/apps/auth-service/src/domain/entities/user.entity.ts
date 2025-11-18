import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('AUTH_USERS')
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
}

