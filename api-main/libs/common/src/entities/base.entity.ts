import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, VersionColumn } from 'typeorm';

/**
 * BaseEntity - Abstract base entity với các trường common
 * Tất cả entities phải kế thừa từ class này
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string;

  @CreateDateColumn({name: 'CREATED_AT'})
  createdAt: Date;

  @UpdateDateColumn({name: 'UPDATED_AT'})
  updatedAt: Date;

  @Column({name: 'CREATED_BY', nullable: true})
  createdBy: string;

  @Column({name: 'UPDATED_BY', nullable: true})
  updatedBy: string;

  @DeleteDateColumn({name: 'DELETED_AT', nullable: true})
  deletedAt: Date | null;

  @VersionColumn({ name: 'VERSION' })
  version: number;

  @Column({name: 'IS_ACTIVE', default: true})
  isActive: boolean;
}

