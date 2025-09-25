import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML11S')
export class Qd3176Xml11s extends BaseEntity {
  @Column({ type: 'uuid', name: 'XML1_ID' })
  @Index()
  xml1Id: string;

  @Column({ name: 'MA_LK', length: 100 })
  @Index()
  maLk: string;

  @Column({ name: 'SO_CT', length: 200, nullable: true })
  soCt: string;

  @Column({ name: 'SO_SERI', length: 200, nullable: true })
  soSeri: string;

  @Column({ name: 'SO_KCB', length: 200, nullable: true })
  soKcb: string;

  @Column({ name: 'DON_VI', length: 1024, nullable: true })
  donVi: string;

  @Column({ name: 'MA_BHXH', length: 10, nullable: true })
  @Index()
  maBhxh: string;

  @Column({ name: 'MA_THE_BHYT', type: 'varchar', length: 20, nullable: true })
  @Index()
  maTheBhyt: string;

  @Column({ name: 'CHAN_DOAN_RV', type: 'varchar', length: 4000, nullable: true })
  chanDoanRv: string;

  @Column({ name: 'PP_DIEUTRI', type: 'varchar', length: 4000, nullable: true })
  ppDieuTri: string;

  @Column({ name: 'MA_DINH_CHI_THAI', type: 'int', nullable: true })
  maDinhChiThai: number;

  @Column({ name: 'NGUYENNHAN_DINHCHI', type: 'varchar', length: 4000, nullable: true })
  nguyenNhanDinhChi: string;

  @Column({ name: 'TUOI_THAI', type: 'int', nullable: true })
  tuoiThai: number;

  @Column({ name: 'SO_NGAY_NGHI', type: 'int', nullable: true })
  soNgayNghi: number;

  @Column({ name: 'TU_NGAY', length: 12, nullable: true })
  tuNgay: string;

  @Column({ name: 'DEN_NGAY', length: 12, nullable: true })
  denNgay: string;

  @Column({ name: 'HO_TEN_CHA', length: 255, nullable: true })
  hoTenCha: string;

  @Column({ name: 'HO_TEN_ME', length: 255, nullable: true })
  hoTenMe: string;

  @Column({ name: 'MA_TTDV', length: 255, nullable: true })
  @Index()
  maTtdv: string;

  @Column({ name: 'MA_BS', length: 255, nullable: true })
  @Index()
  maBs: string;

  @Column({ name: 'NGAY_CT', length: 12, nullable: true })
  ngayCt: string;

  @Column({ name: 'MA_THE_TAM', length: 15, nullable: true })
  maTheTam: string;

  @Column({ name: 'MAU_SO', length: 5, nullable: true })
  mauSo: string;

  @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
  duPhong: string;
}