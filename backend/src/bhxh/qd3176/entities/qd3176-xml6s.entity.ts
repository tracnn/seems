import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML6S')
export class Qd3176Xml6s extends BaseEntity {
  @Column({ type: 'uuid', name: 'XML1_ID' })
  @Index()
  xml1Id: string;

  @Column({ name: 'MA_LK', type: 'varchar', length: 100 })
  @Index()
  maLk: string;

  @Column({ name: 'MA_THE_BHYT', type: 'varchar', nullable: true })
  @Index()
  maTheBhyt: string;

  @Column({ name: 'SO_CCCD', type: 'varchar', nullable: true })
  @Index()
  soCccd: string;

  @Column({ name: 'NGAY_SINH', type: 'varchar', length: 12, nullable: true })
  @Index()
  ngaySinh: string;

  @Column({ name: 'GIOI_TINH', type: 'int', width: 1, nullable: true })
  gioiTinh: number;

  @Column({ name: 'DIA_CHI', type: 'varchar', length: 1024, nullable: true })
  diaChi: string;

  @Column({ name: 'MATINH_CU_TRU', type: 'varchar', length: 3, nullable: true })
  maTinhCuTru: string;

  @Column({ name: 'MA_HUYEN_CU_TRU', type: 'varchar', length: 3, nullable: true })
  maHuyenCuTru: string;

  @Column({ name: 'MAXA_CU_TRU', type: 'varchar', length: 5, nullable: true })
  maXaCuTru: string;

  @Column({ name: 'NGAYKD_HIV', type: 'varchar', length: 12, nullable: true })
  ngayKdHiv: string;

  @Column({ name: 'NOI_LAY_MAU_XN', type: 'varchar', length: 5, nullable: true })
  noiLayMauXn: string;

  @Column({ name: 'NOI_XN_KD', type: 'varchar', length: 5, nullable: true })
  noiXnKd: string;

  @Column({ name: 'NOI_BDDT_ARV', type: 'varchar', length: 5, nullable: true })
  noiBddtArv: string;

  @Column({ name: 'BDDTARV', type: 'varchar', length: 12, nullable: true })
  bddtArv: string;

  @Column({ name: 'MA_PHAC_DO_DIEU_TRI_BD', type: 'varchar', length: 200, nullable: true })
  @Index()
  maPhacDoBd: string;

  @Column({ name: 'MA_BAC_PHAC_DO_BD', type: 'int', width: 1, nullable: true })
  @Index()
  maBacPhacDoBd: number;

  @Column({ name: 'MA_LYDO_DTRI', type: 'int', width: 1, nullable: true })
  @Index()
  maLyDoDtri: number;

  @Column({ name: 'LOAI_DTRI_LAO', type: 'int', width: 1, nullable: true })
  loaiDtriLao: number;

  @Column({ name: 'SANG_LOC_LAO', type: 'int', width: 1, nullable: true })
  sangLocLao: number;

  @Column({ name: 'PHAC_DO_DTR_ILAO', type: 'int', width: 2, nullable: true })
  phacDoDtrILao: number;

  @Column({ name: 'NGAYBD_DTRI_LAO', type: 'varchar', length: 12, nullable: true })
  ngayBdDtriLao: string;

  @Column({ name: 'NGAYKT_DTRI_LAO', type: 'varchar', length: 12, nullable: true })
  ngayKtDtriLao: string;

  @Column({ name: 'KQ_DTRI_LAO', type: 'int', width: 1, nullable: true })
  kqDtriLao: number;

  @Column({ name: 'MA_LYDO_XNTL_VR', type: 'int', width: 1, nullable: true })
  @Index()
  maLyDoXnTlVr: number;

  @Column({ name: 'NGAY_XN_TLVR', type: 'varchar', length: 12, nullable: true })
  ngayXnTlvr: string;

  @Column({ name: 'KQ_XNTL_VR', type: 'int', width: 1, nullable: true })
  kqXnTlvr: number;

  @Column({ name: 'NGAY_KQ_XN_TLVR', type: 'varchar', length: 12, nullable: true })
  ngayKqXnTlvr: string;

  @Column({ name: 'MA_LOAI_BN', type: 'int', width: 1, nullable: true })
  @Index()
  maLoaiBn: number;

  @Column({ name: 'GAI_DOAN_LAM_SANG', type: 'int', width: 1, nullable: true })
  giaiDoanLamSang: number;

  @Column({ name: 'NHOM_DOI_TUONG', type: 'int', width: 2, nullable: true })
  nhomDoiTuong: number;

  @Column({ name: 'MA_TINH_TRANG_DK', type: 'varchar', length: 18, nullable: true })
  @Index()
  maTinhTrangDk: string;

  @Column({ name: 'LAN_XN_PCR', type: 'int', width: 1, nullable: true })
  lanXnPcr: number;

  @Column({ name: 'NGAY_XN_PCR', type: 'varchar', length: 12, nullable: true })
  ngayXnPcr: string;

  @Column({ name: 'NGAY_KQ_XN_PCR', type: 'varchar', length: 12, nullable: true })
  ngayKqXnPcr: string;

  @Column({ name: 'MA_KQ_XN_PCR', type: 'int', width: 1, nullable: true })
  @Index()
  maKqXnPcr: number;

  @Column({ name: 'NGAY_NHAN_TT_MANG_THAI', type: 'varchar', length: 12, nullable: true })
  ngayNhanTtMangThai: string;

  @Column({ name: 'NGAY_BAT_DAU_DT_CTX', type: 'varchar', length: 12, nullable: true })
  ngayBatDauDtCtx: string;

  @Column({ name: 'MA_XU_TRI', type: 'varchar', length: 10, nullable: true })
  @Index()
  maXuTri: string;

  @Column({ name: 'NGAY_BAT_DAU_XU_TRI', type: 'varchar', length: 12, nullable: true })
  ngayBatDauXuTri: string;

  @Column({ name: 'NGAY_KET_THUC_XU_TRI', type: 'varchar', length: 12, nullable: true })
  ngayKetThucXuTri: string;

  @Column({ name: 'MA_PHAC_DO_DIEU_TRI', type: 'varchar', length: 200, nullable: true })
  maPhacDoDieuTri: string;

  @Column({ name: 'MA_BAC_PHAC_DO', type: 'int', width: 1, nullable: true })
  maBacPhacDo: number;

  @Column({ name: 'SO_NGAY_CAP_THUOC_ARV', type: 'int', width: 3, nullable: true })
  soNgayCapThuocArv: number;

  @Column({ name: 'NGAY_CHUYEN_PHAC_DO', type: 'varchar', length: 12, nullable: true })
  ngayChuyenPhacDo: string;

  @Column({ name: 'LY_DO_CHUYEN_PHAC_DO', type: 'int', width: 1, nullable: true })
  lyDoChuyenPhacDo: number;

  @Column({ name: 'MA_CSKCB', type: 'varchar', length: 5, nullable: true })
  @Index()
  maCskcb: string;

  @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
  duPhong: string;
}