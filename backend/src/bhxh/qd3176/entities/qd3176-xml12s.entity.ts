import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML12S')
export class Qd3176Xml12s extends BaseEntity {
    @Column({ name: 'NGUOI_CHU_TRI', length: 255, nullable: true })
    nguoiChuTri: string;

    @Column({ name: 'CHUC_VU', type: 'int', nullable: true })
    chucVu: number;

    @Column({ name: 'NGAY_HOP', length: 12, nullable: true })
    ngayHop: string;

    @Column({ name: 'HO_TEN', length: 255, nullable: true })
    hoTen: string;

    @Column({ name: 'NGAY_SINH', length: 12, nullable: true })
    ngaySinh: string;

    @Column({ name: 'SO_CCCD', type: 'varchar', length: 20, nullable: true })
    soCccd: string;

    @Column({ name: 'NGAY_CAP_CCCD', length: 12, nullable: true })
    ngayCapCccd: string;

    @Column({ name: 'NOI_CAP_CCCD', length: 1024, nullable: true })
    noiCapCccd: string;

    @Column({ name: 'DIA_CHI', length: 1024, nullable: true })
    diaChi: string;

    @Column({ name: 'MATINH_CU_TRU', length: 3, nullable: true })
    maTinhCuTru: string;

    @Column({ name: 'MAHUYEN_CU_TRU', length: 3, nullable: true })
    maHuyenCuTru: string;

    @Column({ name: 'MAXA_CU_TRU', length: 5, nullable: true })
    maXaCuTru: string;

    @Column({ name: 'MA_BHXH', length: 10, nullable: true })
    @Index()
    maBhxh: string;

    @Column({ name: 'MA_THE_BHYT', length: 15, nullable: true })
    @Index()
    maTheBhyt: string;

    @Column({ name: 'NGHE_NGHIEP', length: 100, nullable: true })
    ngheNghiep: string;

    @Column({ name: 'DIEN_THOAI', length: 15, nullable: true })
    dienThoai: string;

    @Column({ name: 'MA_DOI_TUONG', length: 20, nullable: true })
    @Index()
    maDoiTuong: string;

    @Column({ name: 'KHAM_GIAM_DINH', type: 'int', nullable: true })
    khamGiamDinh: number;

    @Column({ name: 'SO_BIEN_BAN', length: 200, nullable: true })
    soBienBan: string;

    @Column({ name: 'TYLE_TTCT_CU', type: 'int', nullable: true })
    tyleTtctCu: number;

    @Column({ name: 'DANG_HUONG_CHE_DO', length: 10, nullable: true })
    dangHuongCheDo: string;

    @Column({ name: 'NGAY_CHUNG_TU', length: 12, nullable: true })
    ngayChungTu: string;

    @Column({ name: 'SO_GIAY_GIOI_THIEU', length: 200, nullable: true })
    soGiayGioiThieu: string;

    @Column({ name: 'NGAY_DE_NGHI', length: 12, nullable: true })
    ngayDeNghi: string;

    @Column({ name: 'MA_DONVI', length: 200, nullable: true })
    @Index()
    maDonVi: string;

    @Column({ name: 'GIOI_THIEU_CUA', length: 1024, nullable: true })
    gioiThieuCua: string;

    @Column({ name: 'KET_QUA_KHAM', type: 'varchar', length: 4000, nullable: true })
    ketQuaKham: string;

    @Column({ name: 'SO_VAN_BAN_CAN_CU', length: 200, nullable: true })
    soVanBanCanCu: string;

    @Column({ name: 'TYLE_TTCT_MOI', type: 'int', nullable: true })
    tyleTtctMoi: number;

    @Column({ name: 'TONG_TYLE_TTCT', type: 'int', nullable: true })
    tongTyleTtct: number;

    @Column({ name: 'DANG_KHUYETTAT', type: 'int', nullable: true })
    dangKhuyettat: number;

    @Column({ name: 'MUC_DO_KHUYETTAT', type: 'int', nullable: true })
    mucDoKhuyettat: number;

    @Column({ name: 'DE_NGHI', type: 'varchar', length: 4000, nullable: true })
    deNghi: string;

    @Column({ name: 'DUOC_XACDINH', type: 'varchar', length: 4000, nullable: true })
    duocXacDinh: string;

    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
}