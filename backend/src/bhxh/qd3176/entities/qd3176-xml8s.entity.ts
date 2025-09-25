import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML8S')
export class Qd3176Xml8s extends BaseEntity {
    @Column({ type: 'uuid', name: 'XML1_ID' })
    @Index()
    xml1Id: string;

    @Column({ name: 'MA_LK', type: 'varchar', length: 100 })
    @Index()
    maLk: string;

    @Column({ name: 'MA_LOAI_KCB', type: 'varchar', length: 2, nullable: true })
    @Index()
    maLoaiKcb: string;

    @Column({ name: 'HO_TEN_CHA', type: 'varchar', length: 255, nullable: true })
    hoTenCha: string;

    @Column({ name: 'HO_TEN_ME', type: 'varchar', length: 255, nullable: true })
    hoTenMe: string;

    @Column({ name: 'NGUOI_GIAM_HO', type: 'varchar', length: 255, nullable: true })
    nguoiGiamHo: string;

    @Column({ name: 'DON_VI', type: 'varchar', length: 1024, nullable: true })
    donVi: string;

    @Column({ name: 'NGAY_VAO', type: 'varchar', length: 12, nullable: true })
    @Index()
    ngayVao: string;

    @Column({ name: 'NGAY_RA', type: 'varchar', length: 12, nullable: true })
    @Index()
    ngayRa: string;

    @Column({ name: 'CHAN_DOAN_VAO', type: 'varchar', length: 4000, nullable: true })
    chanDoanVao: string;

    @Column({ name: 'CHAN_DOAN_RV', type: 'varchar', length: 4000, nullable: true })
    chanDoanRv: string;

    @Column({ name: 'QT_BENHLY', type: 'varchar', length: 4000, nullable: true })
    quaTrinhBenhLy: string;

    @Column({ name: 'TOMTAT_KQ', type: 'varchar', length: 4000, nullable: true })
    tomTatKetQua: string;

    @Column({ name: 'PP_DIEUTRI', type: 'varchar', length: 4000, nullable: true })
    phuongPhapDieuTri: string;

    @Column({ name: 'NGAY_SINHCON', type: 'varchar', length: 12, nullable: true })
    ngaySinhCon: string;

    @Column({ name: 'NGAY_CONCHET', type: 'varchar', length: 12, nullable: true })
    ngayConChet: string;

    @Column({ name: 'SO_CONCHET', type: 'int', nullable: true })
    soConChet: number;

    @Column({ name: 'KET_QUA_DTRI', type: 'int', nullable: true })
    ketQuaDieuTri: number;

    @Column({ name: 'GHI_CHU', type: 'varchar', length: 4000, nullable: true })
    ghiChu: string;

    @Column({ name: 'MA_TTDV', type: 'varchar', length: 255, nullable: true })
    @Index()
    maTtdv: string;

    @Column({ name: 'NGAY_CT', type: 'varchar', length: 12, nullable: true })
    ngayChungTu: string;

    @Column({ name: 'MA_THE_TAM', type: 'varchar', length: 15, nullable: true })
    maTheTam: string;

    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
}