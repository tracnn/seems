import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('AUTH_REFRESH_TOKENS')
export class RefreshToken extends BaseEntity {
  @Column({
    name: 'USER_ID',
    length: 36,
  })
  userId: string; // Reference to IAM Service User ID (no foreign key)

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

