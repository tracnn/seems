import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML7S')
export class Qd3176Xml7s extends BaseEntity {
  @Column({ type: 'uuid', name: 'XML1_ID' })
  @Index()
  xml1Id: string;

  @Column({ name: 'MA_LK', type: 'varchar', length: 100 })
  @Index()
  maLk: string;

  @Column({ name: 'SO_LUU_TRU', type: 'varchar', length: 200, nullable: true })
  soLuuTru: string;

  @Column({ name: 'MA_YTE', type: 'varchar', length: 200, nullable: true })
  @Index()
  maYte: string;

  @Column({ name: 'MA_KHOA_RV', type: 'varchar', length: 200, nullable: true })
  @Index()
  maKhoaRv: string;

  @Column({ name: 'NGAY_VAO', type: 'varchar', length: 12, nullable: true })
  @Index()
  ngayVao: string;

  @Column({ name: 'NGAY_RA', type: 'varchar', length: 12, nullable: true })
  @Index()
  ngayRa: string;

  @Column({ name: 'MA_DINH_CHI_THAI', type: 'int', width: 1, nullable: true })
  maDinhChiThai: number;

  @Column({ name: 'NGUYENNHAN_DINHCHI', type: 'varchar', nullable: true })
  nguyenNhanDinhChi: string;

  @Column({ name: 'THOIGIAN_DINHCHI', type: 'varchar', length: 12, nullable: true })
  thoiGianDinhChi: string;

  @Column({ name: 'TUOI_THAI', type: 'int', width: 2, nullable: true })
  tuoiThai: number;

  @Column({ name: 'CHAN_DOAN_RV', type: 'varchar', length: 1500, nullable: true })
  chanDoanRv: string;

  @Column({ name: 'PP_DIEUTRI', type: 'varchar', nullable: true })
  ppDieuTri: string;

  @Column({ name: 'GHI_CHU', type: 'varchar', length: 1500, nullable: true })
  ghiChu: string;

  @Column({ name: 'MA_TTDV', type: 'varchar', length: 255, nullable: true })
  @Index()
  maTtdv: string;

  @Column({ name: 'MA_BS', type: 'varchar', length: 255, nullable: true })
  @Index()
  maBs: string;

  @Column({ name: 'TEN_BS', type: 'varchar', length: 255, nullable: true })
  tenBs: string;

  @Column({ name: 'NGAY_CT', type: 'varchar', length: 12, nullable: true })
  ngayCt: string;

  @Column({ name: 'MA_CHA', type: 'varchar', length: 10, nullable: true })
  @Index()
  maCha: string;

  @Column({ name: 'MA_ME', type: 'varchar', length: 10, nullable: true })
  @Index()
  maMe: string;

  @Column({ name: 'MA_THE_TAM', type: 'varchar', length: 15, nullable: true })
  maTheTam: string;

  @Column({ name: 'HO_TEN_CHA', type: 'varchar', length: 255, nullable: true })
  hoTenCha: string;

  @Column({ name: 'HO_TEN_ME', type: 'varchar', length: 255, nullable: true })
  hoTenMe: string;

  @Column({ name: 'SO_NGAY_NGHI', type: 'int', width: 3, nullable: true })
  soNgayNghi: number;

  @Column({ name: 'NGOAITRU_TUNGAY', type: 'varchar', length: 12, nullable: true })
  ngoaiTruTuNgay: string;

  @Column({ name: 'NGOAITRU_DENNGAY', type: 'varchar', length: 12, nullable: true })
  ngoaiTruDenNgay: string;

  @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
  duPhong: string;
}