import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML3S')
export class Qd3176Xml3s extends BaseEntity {
    @Column({ type: 'uuid', name: 'XML1_ID' })
    @Index()
    xml1Id: string;
  
    @Column({ name: 'MA_LK', length: 100 })
    @Index()
    maLk: string;

    @Column({ name: 'STT', type: 'int', nullable: true })
    stt: number;

    @Column({ name: 'MA_DICH_VU', length: 50, nullable: true })
    @Index()
    maDichVu: string;

    @Column({ name: 'MA_PTTT_QT', length: 255, nullable: true })
    @Index()
    maPtttQt: string;

    @Column({ name: 'MAVATTU', length: 255, nullable: true })
    @Index()
    maVatTu: string;

    @Column({ name: 'MA_NHOM', type: 'int', nullable: true })
    @Index()
    maNhom: number;

    @Column({ name: 'GOI_VTYT', length: 3, nullable: true })
    goiVtyt: string;

    @Column({ name: 'TEN_VAT_TU', length: 1024, nullable: true })
    tenVatTu: string;

    @Column({ name: 'TEN_DICH_VU', length: 1024, nullable: true })
    tenDichVu: string;

    @Column({ name: 'MA_XANG_DAU', length: 20, nullable: true })
    @Index()
    maXangDau: string;

    @Column({ name: 'DON_VI_TINH', length: 50, nullable: true })
    donViTinh: string;

    @Column({ name: 'PHAM_VI', type: 'int', nullable: true })
    phamVi: number;

    @Column({ name: 'SO_LUONG', type: 'float', nullable: true })
    soLuong: number;

    @Column({ name: 'DON_GIA_BV', type: 'float', nullable: true })
    donGiaBv: number;

    @Column({ name: 'DON_GIA_BH', type: 'float', nullable: true })
    donGiaBh: number;

    @Column({ name: 'TT_THAU', length: 50, nullable: true })
    @Index()
    ttThau: string;

    @Column({ name: 'TYLE_TT_DV', type: 'int', nullable: true })
    tyleTtDv: number;

    @Column({ name: 'TYLE_TT_BH', type: 'int', nullable: true })
    tyleTtBh: number;

    @Column({ name: 'THANH_TIEN_BV', type: 'float', nullable: true })
    thanhTienBv: number;

    @Column({ name: 'THANH_TIEN_BH', type: 'float', nullable: true })
    thanhTienBh: number;

    @Column({ name: 'T_TRANTT', type: 'float', nullable: true })
    tTrantt: number;

    @Column({ name: 'MUC_HUONG', type: 'int', nullable: true })
    mucHuong: number;

    @Column({ name: 'T_NGUONKHAC_NSNN', type: 'float', nullable: true })
    tNguonKhacNsnn: number;

    @Column({ name: 'T_NGUONKHAC_VTNN', type: 'float', nullable: true })
    tNguonKhacVtnn: number;

    @Column({ name: 'T_NGUONKHAC_VTTN', type: 'float', nullable: true })
    tNguonKhacVttn: number;

    @Column({ name: 'T_NGUONKHAC_CL', type: 'float', nullable: true })
    tNguonKhacCl: number;

    @Column({ name: 'T_NGUONKHAC', type: 'float', nullable: true })
    tNguonKhac: number;

    @Column({ name: 'T_BNTT', type: 'float', nullable: true })
    tBntt: number;

    @Column({ name: 'T_BNCCT', type: 'float', nullable: true })
    tBncct: number;

    @Column({ name: 'T_BHTT', type: 'float', nullable: true })
    tBhtt: number;

    @Column({ name: 'MA_KHOA', length: 50, nullable: true })
    @Index()
    maKhoa: string;

    @Column({ name: 'MA_GIUONG', length: 50, nullable: true })
    @Index()
    maGiuong: string;

    @Column({ name: 'MA_BAC_SI', length: 255, nullable: true })
    @Index()
    maBacSi: string;

    @Column({ name: 'NGUOI_THUC_HIEN', length: 1024, nullable: true })
    @Index()
    nguoiThucHien: string;

    @Column({ name: 'MA_BENH', length: 100, nullable: true })
    @Index()
    maBenh: string;

    @Column({ name: 'MA_BENH_YHCT', length: 150, nullable: true })
    @Index()
    maBenhYhct: string;

    @Column({ name: 'NGAY_YL', length: 12, nullable: true })
    @Index()
    ngayYl: string;

    @Column({ name: 'NGAY_TH_YL', length: 12, nullable: true })
    @Index()
    ngayThYl: string;

    @Column({ name: 'NGAY_KQ', length: 12, nullable: true })
    @Index()
    ngayKq: string;

    @Column({ name: 'MA_PTTT', type: 'int', nullable: true })
    @Index()
    maPttt: number;

    @Column({ name: 'VET_THUONG_TP', type: 'int', nullable: true })
    vetThuongTp: number;

    @Column({ name: 'PP_VO_CAM', type: 'int', nullable: true })
    @Index()
    ppVoCam: number;

    @Column({ name: 'VI_TRI_TH_DVKT', type: 'int', nullable: true })
    viTriThDvkt: number;

    @Column({ name: 'MA_MAY', length: 1024, nullable: true })
    @Index()
    maMay: string;

    @Column({ name: 'MA_HIEU_SP', length: 255, nullable: true })
    maHieuSp: string;

    @Column({ name: 'TAI_SU_DUNG', type: 'int', nullable: true })
    taiSuDung: number;

    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
}
