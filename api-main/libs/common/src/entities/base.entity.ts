import {
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Generated,
} from 'typeorm';

/**
 * BaseEntity - Abstract base entity với các trường common
 * Tất cả entities phải kế thừa từ class này
 * Tương thích với Oracle Database
 */
export abstract class BaseEntity {
  // Sử dụng UUID với type varchar2 cho Oracle
  @PrimaryColumn({
    type: 'varchar2',
    length: 36,
    name: 'ID',
  })
  @Generated('uuid')
  id: string;

  @CreateDateColumn({
    name: 'CREATED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'UPDATED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    name: 'CREATED_BY',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  createdBy: string;

  @Column({
    name: 'UPDATED_BY',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  updatedBy: string;

  @DeleteDateColumn({
    name: 'DELETED_AT',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;

  @Column({
    name: 'VERSION',
    type: 'number',
    default: 1,
  })
  version: number;

  @Column({
    name: 'IS_ACTIVE',
    type: 'number',
    default: 1,
    transformer: {
      to: (value: boolean): number => (value ? 1 : 0),
      from: (value: number): boolean => value === 1,
    },
  })
  isActive: boolean;

  @BeforeInsert()
  setDefaultVersion() {
    if (!this.version) {
      this.version = 1;
    }
  }

  @BeforeUpdate()
  incrementVersion() {
    this.version += 1;
  }
}

