import { Column, Entity, Index} from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML15S')
export class Qd3176Xml15s extends BaseEntity {
    @Column({ type: 'uuid', name: 'XML1_ID' })
    @Index()
    xml1Id: string;

    @Column({ name: 'MA_LK', length: 100 })
    @Index()
    maLk: string;

    @Column({ name: 'STT', type: 'int' })
    stt: number;

    @Column({ name: 'MA_BN', length: 100, nullable: true })
    @Index()
    maBn: string;

    @Column({ name: 'HO_TEN', length: 255, nullable: true })
    hoTen: string;

    @Column({ name: 'SO_CCCD', nullable: true })
    @Index()
    soCccd: string;

    @Column({ name: 'PHANLOAI_LAO_VITRI', type: 'int', nullable: true })
    phanLoaiLaoViTri: number;

    @Column({ name: 'PHANLOAI_LAO_TS', type: 'int', nullable: true })
    phanLoaiLaoTienSu: number;

    @Column({ name: 'PHANLOAI_LAO_HIV', type: 'int', nullable: true })
    phanLoaiLaoHiv: number;

    @Column({ name: 'PHANLOAI_LAO_VK', type: 'int', nullable: true })
    phanLoaiLaoViKhuan: number;

    @Column({ name: 'PHANLOAI_LAO_KT', type: 'int', nullable: true })
    phanLoaiLaoKhangThuoc: number;

    @Column({ name: 'LOAI_DTRI_LAO', type: 'int', nullable: true })
    loaiDieuTriLao: number;

    @Column({ name: 'NGAYBD_DTRI_LAO', length: 12, nullable: true })
    ngayBatDauDieuTriLao: string;

    @Column({ name: 'PHACDO_DTRI_LAO', type: 'int', nullable: true })
    phacDoDieuTriLao: number;

    @Column({ name: 'NGAYKT_DTRI_LAO', length: 12, nullable: true })
    ngayKetThucDieuTriLao: string;

    @Column({ name: 'KET_QUA_DTRI_LAO', type: 'int', nullable: true })
    ketQuaDieuTriLao: number;

    @Column({ name: 'MA_CSKCB', length: 5, nullable: true })
    @Index()
    maCskcb: string;

    @Column({ name: 'NGAYKD_HIV', length: 12, nullable: true })
    ngayKhangDinhHiv: string;

    @Column({ name: 'BDDT_ARV', length: 12, nullable: true })
    batDauDieuTriArv: string;

    @Column({ name: 'NGAY_BAT_DAU_DT_CTX', length: 12, nullable: true })
    ngayBatDauDieuTriCtx: string;

    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
}