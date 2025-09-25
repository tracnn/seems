import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT' })
  updatedAt: Date;

  @Column({ name: 'CREATED_BY', nullable: true })
  createdBy: string;

  @Column({ name: 'UPDATED_BY', nullable: true })
  updatedBy: string;

  @VersionColumn({ name: 'VERSION' })
  version: number;
  
  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;

  @Column({ name: 'IS_DELETE', default: false })
  isDelete: boolean;
}
