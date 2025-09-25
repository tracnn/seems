import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML10S')
export class Qd3176Xml10s extends BaseEntity {
  @Column({ type: 'uuid', name: 'XML1_ID' })
  @Index()
  xml1Id: string;

  @Column({ name: 'MA_LK', type: 'varchar', length: 100 })
  @Index()
  maLk: string;

  @Column({ name: 'SO_SERI', type: 'varchar', length: 200, nullable: true })
  soSeri: string;

  @Column({ name: 'SO_CT', type: 'varchar', length: 200, nullable: true })
  soCt: string;

  @Column({ name: 'SO_NGAY', type: 'int', nullable: true })
  soNgay: number;

  @Column({ name: 'DON_VI', type: 'varchar', length: 1024, nullable: true })
  donVi: string;

  @Column({ name: 'CHAN_DOAN_RV', type: 'varchar', length: 4000, nullable: true })
  chanDoanRv: string;

  @Column({ name: 'TU_NGAY', type: 'varchar', length: 12, nullable: true })
  tuNgay: string;

  @Column({ name: 'DEN_NGAY', type: 'varchar', length: 12, nullable: true })
  denNgay: string;

  @Column({ name: 'MA_TTDV', type: 'varchar', length: 255, nullable: true })
  @Index()
  maTtdv: string;

  @Column({ name: 'TEN_BS', type: 'varchar', length: 255, nullable: true })
  tenBs: string;

  @Column({ name: 'MA_BS', type: 'varchar', length: 255, nullable: true })
  @Index()
  maBs: string;

  @Column({ name: 'NGAY_CT', type: 'varchar', length: 12, nullable: true })
  ngayCt: string;

  @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
  duPhong: string;
}