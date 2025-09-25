import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'token' })
    token: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: string;
} 