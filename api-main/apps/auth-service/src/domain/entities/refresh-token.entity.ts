import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';
import { User } from './user.entity';

@Entity('REFRESH_TOKENS')
export class RefreshToken extends BaseEntity {
  @Column({
    name: 'USER_ID',
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @Column({
    name: 'TOKEN',
    type: 'varchar2',
    length: 500,
    unique: true,
  })
  token: string;

  @Column({
    name: 'EXPIRES_AT',
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    name: 'IS_REVOKED',
    type: 'number',
    default: 0,
  })
  isRevoked: number;

  @Column({
    name: 'IP_ADDRESS',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress: string | null;

  @Column({
    name: 'USER_AGENT',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  userAgent: string | null;
}

