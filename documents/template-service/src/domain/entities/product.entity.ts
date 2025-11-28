import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/common';

/**
 * Product Entity - Example entity for template service
 * Replace "Product" with your actual entity name
 */
@Entity('TEMPLATE_PRODUCTS')
export class Product extends BaseEntity {
  @Column({
    name: 'NAME',
    length: 200,
  })
  name: string;

  @Column({
    name: 'CODE',
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    name: 'DESCRIPTION',
    type: 'clob',
    nullable: true,
  })
  description: string;

  @Column({
    name: 'PRICE',
    type: 'number',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  price: number;

  @Column({
    name: 'QUANTITY',
    type: 'number',
    default: 0,
  })
  quantity: number;

  @Column({
    name: 'CATEGORY',
    length: 100,
    nullable: true,
  })
  category: string;

  @Column({
    name: 'SKU',
    length: 100,
    nullable: true,
  })
  sku: string;

  // Note: isActive inherited from BaseEntity
}

