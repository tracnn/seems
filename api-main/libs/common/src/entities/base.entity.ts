import {
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  Generated,
  VersionColumn,
} from 'typeorm';

/**
 * BaseEntity - Abstract base entity với các trường common
 * Tất cả entities phải kế thừa từ class này
 * Tương thích với Oracle Database
 */
export abstract class BaseEntity {
  // Sử dụng UUID với type varchar2 cho Oracle
  @PrimaryColumn({ name: 'ID', length: 36 })
  @Generated('uuid')
  id: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'CREATED_BY', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'UPDATED_BY', length: 100, nullable: true })
  updatedBy: string;

  @DeleteDateColumn({ name: 'DELETED_AT', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @VersionColumn({name: 'VERSION'})
  version: number;

  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;
}

