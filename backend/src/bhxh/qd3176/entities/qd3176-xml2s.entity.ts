import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
  
  @Entity('QD3176_XML2S')
  export class Qd3176Xml2s extends BaseEntity {
    @Column({ type: 'uuid', name: 'XML1_ID' })
    @Index()
    xml1Id: string;

    @Column({ name: 'MA_LK', length: 100 })
    @Index()
    maLk: string;
  
    @Column({ name: 'STT', type: 'int', nullable: true })
    stt: number;
  
    @Column({ name: 'MA_THUOC', length: 255, nullable: true })
    @Index()
    maThuoc: string;
  
    @Column({ name: 'MA_PP_CHEBIEN', length: 255, nullable: true })
    @Index()
    maPpCheBien: string;
  
    @Column({ name: 'MA_CSKCB_THUOC', length: 10, nullable: true })
    @Index()
    maCskcbThuoc: string;
  
    @Column({ name: 'MA_NHOM', type: 'int', nullable: true })
    @Index()
    maNhom: number;
  
    @Column({ name: 'TEN_THUOC', length: 1024, nullable: true })
    tenThuoc: string;
  
    @Column({ name: 'DON_VI_TINH', length: 50, nullable: true })
    donViTinh: string;
  
    @Column({ name: 'HAM_LUONG', length: 1024, nullable: true })
    hamLuong: string;
  
    @Column({ name: 'DUONG_DUNG', length: 4, nullable: true })
    @Index()
    duongDung: string;
  
    @Column({ name: 'DANG_BAO_CHE', length: 1024, nullable: true })
    dangBaoChe: string;
  
    @Column({ name: 'LIEU_DUNG', length: 1024, nullable: true })
    lieuDung: string;
  
    @Column({ name: 'CACH_DUNG', length: 1024, nullable: true })
    cachDung: string;
  
    @Column({ name: 'SO_DANG_KY', length: 255, nullable: true })
    soDangKy: string;
  
    @Column({ name: 'TT_THAU', length: 255, nullable: true })
    ttThau: string;
  
    @Column({ name: 'PHAM_VI', type: 'int', nullable: true })
    phamVi: number;
  
    @Column({ name: 'TYLE_TT_BH', type: 'int', nullable: true })
    tyleTtBh: number;
  
    @Column({ name: 'SO_LUONG', type: 'decimal', precision: 15, scale: 3, nullable: true })
    soLuong: number;
  
    @Column({ name: 'DON_GIA', type: 'decimal', precision: 15, scale: 3, nullable: true })
    donGia: number;
  
    @Column({ name: 'THANH_TIEN_BV', type: 'decimal', precision: 15, scale: 2, nullable: true })
    thanhTienBv: number;
  
    @Column({ name: 'THANH_TIEN_BH', type: 'decimal', precision: 15, scale: 2, nullable: true })
    thanhTienBh: number;
  
    @Column({ name: 'T_NGUONKHAC_NSNN', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tNguonKhacNsnn: number;
  
    @Column({ name: 'T_NGUONKHAC_VTNN', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tNguonKhacVtnn: number;
  
    @Column({ name: 'T_NGUONKHAC_VTTN', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tNguonKhacVttn: number;
  
    @Column({ name: 'T_NGUONKHAC_CL', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tNguonKhacCl: number;
  
    @Column({ name: 'T_NGUONKHAC', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tNguonKhac: number;
  
    @Column({ name: 'MUC_HUONG', type: 'int', nullable: true })
    mucHuong: number;
  
    @Column({ name: 'T_BNTT', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tBntt: number;
  
    @Column({ name: 'T_BNCCT', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tBncct: number;
  
    @Column({ name: 'T_BHTT', type: 'decimal', precision: 15, scale: 2, nullable: true })
    tBhtt: number;
  
    @Column({ name: 'MA_KHOA', length: 50, nullable: true })
    @Index()
    maKhoa: string;
  
    @Column({ name: 'MA_BAC_SI', length: 255, nullable: true })
    @Index()
    maBacSi: string;
  
    @Column({ name: 'MA_DICH_VU', length: 255, nullable: true })
    @Index()
    maDichVu: string;
  
    @Column({ name: 'NGAY_YL', length: 12, nullable: true })
    @Index()
    ngayYl: string;
  
    @Column({ name: 'NGAY_TH_YL', length: 12, nullable: true })
    @Index()
    ngayThYl: string;
  
    @Column({ name: 'MA_PTTT', type: 'int', nullable: true })
    @Index()
    maPttt: number;
  
    @Column({ name: 'NGUON_CTRA', type: 'int', nullable: true })
    nguonCtra: number;
  
    @Column({ name: 'VET_THUONG_TP', type: 'int', nullable: true })
    vetThuongTp: number;
  
    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
  }