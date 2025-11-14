import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';
import { User } from './user.entity';

@Entity('REFRESH_TOKENS')
export class RefreshToken extends BaseEntity {
  @Column({
    name: 'USER_ID',
    length: 36,
  })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @Column({
    name: 'TOKEN',
    length: 500,
    unique: true,
  })
  token: string;

  @Column({
    name: 'EXPIRES_AT',
  })
  expiresAt: Date;

  @Column({
    name: 'IS_REVOKED',
    default: false,
  })
  isRevoked: boolean;

  @Column({
    name: 'IP_ADDRESS',
    length: 45,
    nullable: true,
  })
  ipAddress: string;

  @Column({
    name: 'USER_AGENT',
    length: 500,
    nullable: true,
  })
  userAgent: string;
}

