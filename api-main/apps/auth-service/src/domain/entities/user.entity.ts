import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('USERS')
export class User extends BaseEntity {
  @Column({
    name: 'USERNAME',
    type: 'varchar2',
    length: 100,
    unique: true,
  })
  username: string;

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    name: 'PASSWORD',
    type: 'varchar2',
    length: 255,
  })
  password: string;

  @Column({
    name: 'FIRST_NAME',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  firstName: string;

  @Column({
    name: 'LAST_NAME',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  lastName: string;

  @Column({
    name: 'IS_EMAIL_VERIFIED',
    type: 'number',
    default: 0,
    transformer: {
      to: (value: boolean): number => (value ? 1 : 0),
      from: (value: number): boolean => value === 1,
    },
  })
  isEmailVerified: boolean;

  @Column({
    name: 'LAST_LOGIN_AT',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt: Date;
}

