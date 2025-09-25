import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML13S')
export class Qd3176Xml13s extends BaseEntity {
    @Column({ type: 'uuid', name: 'XML1_ID' })
    @Index()
    xml1Id: string;

    @Column({ name: 'MA_LK', length: 100 })
    @Index()
    maLk: string;

    @Column({ name: 'SO_HOSO', length: 50, nullable: true })
    soHoSo: string;

    @Column({ name: 'SO_CHUYENTUYEN', length: 50, nullable: true })
    soChuyenTuyen: string;

    @Column({ name: 'GIAY_CHUYEN_TUYEN', length: 50, nullable: true })
    giayChuyenTuyen: string;

    @Column({ name: 'MA_CSKCB', length: 5, nullable: true })
    @Index()
    maCskcb: string;

    @Column({ name: 'MA_CSKCB_DI', length: 100, nullable: true })
    @Index()
    maCskcbDi: string;

    @Column({ name: 'MA_CSKCB_DEN', length: 5, nullable: true })
    @Index()
    maCskcbDen: string;

    @Column({ name: 'HO_TEN', length: 255, nullable: true })
    hoTen: string;

    @Column({ name: 'NGAY_SINH', length: 12, nullable: true })
    ngaySinh: string;

    @Column({ name: 'GIOI_TINH', type: 'int', nullable: true })
    gioiTinh: number;

    @Column({ name: 'MA_QUOCTICH', length: 3, nullable: true })
    maQuocTich: string;

    @Column({ name: 'MA_DANTOC', length: 2, nullable: true })
    maDanToc: string;

    @Column({ name: 'MA_NGHE_NGHIEP', length: 5, nullable: true })
    maNgheNghiep: string;

    @Column({ name: 'DIA_CHI', length: 1024, nullable: true })
    diaChi: string;

    @Column({ name: 'MA_THE_BHYT', nullable: true })
    @Index()
    maTheBhyt: string;

    @Column({ name: 'GT_THE_DEN', nullable: true })
    gtTheDen: string;

    @Column({ name: 'NGAY_VAO', length: 100, nullable: true })
    ngayVao: string;

    @Column({ name: 'NGAY_VAO_NOI_TRU', length: 12, nullable: true })
    ngayVaoNoiTru: string;

    @Column({ name: 'NGAY_RA', length: 100, nullable: true })
    ngayRa: string;

    @Column({ name: 'DAU_HIEU_LS', type: 'varchar', length: 4000, nullable: true })
    dauHieuLs: string;

    @Column({ name: 'CHAN_DOAN_RV', type: 'varchar', length: 4000, nullable: true })
    chanDoanRv: string;

    @Column({ name: 'QT_BENHLY', type: 'varchar', length: 4000, nullable: true })
    qtBenhLy: string;

    @Column({ name: 'TOMTAT_KQ', type: 'varchar', length: 4000, nullable: true })
    tomTatKq: string;

    @Column({ name: 'PP_DIEUTRI', type: 'varchar', length: 4000, nullable: true })
    ppDieuTri: string;

    @Column({ name: 'MA_BENH_CHINH', length: 100, nullable: true })
    @Index()
    maBenhChinh: string;

    @Column({ name: 'MA_BENH_KT', length: 100, nullable: true })
    maBenhKt: string;

    @Column({ name: 'MA_BENH_YHCT', length: 255, nullable: true })
    maBenhYhct: string;

    @Column({ name: 'TEN_DICH_VU', length: 4000, nullable: true })
    tenDichVu: string;

    @Column({ name: 'TEN_THUOC', length: 4000, nullable: true })
    tenThuoc: string;

    @Column({ name: 'TINH_TRANG_CT', type: 'varchar', length: 4000, nullable: true })
    tinhTrangCt: string;

    @Column({ name: 'MA_LOAI_RV', type: 'int', nullable: true })
    @Index()
    maLoaiRv: number;

    @Column({ name: 'MA_LYDO_CT', type: 'int', nullable: true })
    @Index()
    maLyDoCt: number;

    @Column({ name: 'HUONG_DIEU_TRI', type: 'varchar', length: 4000, nullable: true })
    huongDieuTri: string;

    @Column({ name: 'PHUONGTIEN_VC', length: 255, nullable: true })
    phuongTienVc: string;

    @Column({ name: 'HOTEN_NGUOI_HT', length: 255, nullable: true })
    hoTenNguoiHt: string;

    @Column({ name: 'CHUCDANH_NGUOI_HT', length: 255, nullable: true })
    chucDanhNguoiHt: string;

    @Column({ name: 'MA_BACSI', length: 255, nullable: true })
    @Index()
    maBacSi: string;

    @Column({ name: 'MA_TTDV', length: 255, nullable: true })
    @Index()
    maTtdv: string;

    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
}