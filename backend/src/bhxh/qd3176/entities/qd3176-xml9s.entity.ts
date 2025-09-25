import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML9S')
export class Qd3176Xml9s extends BaseEntity {
  @Column({ type: 'uuid', name: 'XML1_ID' })
  @Index()
  xml1Id: string;

  @Column({ name: 'MA_LK', type: 'varchar', length: 100 })
  @Index()
  maLk: string;

  @Column({ name: 'MA_BHXH_NND', type: 'varchar', length: 10, nullable: true })
  @Index()
  maBhxhNnd: string;

  @Column({ name: 'MA_THE_NND', type: 'varchar', length: 15, nullable: true })
  @Index()
  maTheNnd: string;

  @Column({ name: 'HO_TEN_NND', type: 'varchar', length: 255, nullable: true })
  hoTenNnd: string;

  @Column({ name: 'NGAYSINH_NND', type: 'varchar', length: 12, nullable: true })
  ngaySinhNnd: string;

  @Column({ name: 'MA_DANTOC_NMD', type: 'varchar', length: 2, nullable: true })
  maDanTocNmd: string;

  @Column({ name: 'SO_CCCD_NND', type: 'varchar', length: 20, nullable: true })
  soCccdNnd: string;

  @Column({ name: 'NGAYCAP_CCCD_NND', type: 'varchar', length: 12, nullable: true })
  ngayCapCccdNnd: string;

  @Column({ name: 'NOICAP_CCCD_NND', type: 'varchar', length: 1024, nullable: true })
  noiCapCccdNnd: string;

  @Column({ name: 'NOI_CU_TRU_NND', type: 'varchar', length: 1024, nullable: true })
  noiCuTruNnd: string;

  @Column({ name: 'MA_QUOCTICH', type: 'varchar', length: 3, nullable: true })
  maQuocTich: string;

  @Column({ name: 'MATINH_CU_TRU', type: 'varchar', length: 3, nullable: true })
  maTinhCuTru: string;

  @Column({ name: 'MAHUYEN_CU_TRU', type: 'varchar', length: 3, nullable: true })
  maHuyenCuTru: string;

  @Column({ name: 'MAXA_CU_TRU', type: 'varchar', length: 5, nullable: true })
  maXaCuTru: string;

  @Column({ name: 'HO_TEN_CHA', type: 'varchar', length: 255, nullable: true })
  hoTenCha: string;

  @Column({ name: 'MA_THE_TAM', type: 'varchar', length: 15, nullable: true })
  maTheTam: string;

  @Column({ name: 'HO_TEN_CON', type: 'varchar', length: 255, nullable: true })
  hoTenCon: string;

  @Column({ name: 'GIOI_TINH_CON', type: 'int', nullable: true })
  gioiTinhCon: number;

  @Column({ name: 'SO_CON', type: 'int', nullable: true })
  soCon: number;

  @Column({ name: 'LAN_SINH', type: 'int', nullable: true })
  lanSinh: number;

  @Column({ name: 'SO_CON_SONG', type: 'int', nullable: true })
  soConSong: number;

  @Column({ name: 'CAN_NANG_CON', type: 'int', nullable: true })
  canNangCon: number;

  @Column({ name: 'NGAY_SINH_CON', type: 'varchar', length: 12, nullable: true })
  ngaySinhCon: string;

  @Column({ name: 'NOI_SINH_CON', type: 'varchar', length: 1024, nullable: true })
  noiSinhCon: string;

  @Column({ name: 'TINH_TRANG_CON', type: 'varchar', length: 4000, nullable: true })
  tinhTrangCon: string;

  @Column({ name: 'SINHCON_PHAUTHUAT', type: 'int', nullable: true })
  sinhConPhauThuat: number;

  @Column({ name: 'SINHCON_DUOI32TUAN', type: 'int', nullable: true })
  sinhConDuoi32Tuan: number;

  @Column({ name: 'GHI_CHU', type: 'varchar', length: 4000, nullable: true })
  ghiChu: string;

  @Column({ name: 'NGUOI_DO_DE', type: 'varchar', length: 255, nullable: true })
  nguoiDoDe: string;

  @Column({ name: 'NGUOI_GHI_PHIEU', type: 'varchar', length: 255, nullable: true })
  nguoiGhiPhieu: string;

  @Column({ name: 'NGAY_CT', type: 'varchar', length: 12, nullable: true })
  ngayCt: string;

  @Column({ name: 'SO', type: 'varchar', length: 200, nullable: true })
  so: string;

  @Column({ name: 'QUYEN_SO', type: 'varchar', length: 200, nullable: true })
  quyenSo: string;

  @Column({ name: 'MA_TTDV', type: 'varchar', length: 255, nullable: true })
  maTtdv: string;

  @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
  duPhong: string;
}