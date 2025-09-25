import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/base.entity';

@Entity('USERS')
export class User extends BaseEntity {
    
    @Index('IDX_USERS_USERNAME', { unique: true })
    @Column({ name: 'USERNAME' })
    username: string;

    @Column({ name: 'FULL_NAME', nullable: true })
    fullName: string;
    
    @Index('IDX_USERS_EMAIL')
    @Column({ name: 'EMAIL', nullable: true })
    email: string;

    @Exclude()
    @Column({ name: 'PASSWORD' })
    password: string;

    @Column({ name: 'IS_LOCK', default: false })
    isLock: boolean;

    @Column({ name: 'LAST_LOGIN_AT', nullable: true })
    lastLoginAt: Date;

    @Column({ name: 'LAST_LOGIN_IP', nullable: true })
    lastLoginIp: string;

    @Column({ name: 'LAST_LOGIN_USER_AGENT', nullable: true })
    lastLoginUserAgent: string;
} 