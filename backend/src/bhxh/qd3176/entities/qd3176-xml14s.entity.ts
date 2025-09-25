import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML14S')
export class Qd3176Xml14s extends BaseEntity {
    @Column({ type: 'uuid', name: 'XML1_ID' })
    @Index()
    xml1Id: string;

    @Column({ name: 'MA_LK', length: 100 })
    @Index()
    maLk: string;

    @Column({ name: 'SO_GIAYHEN_KL', length: 50, nullable: true })
    soGiayHenKl: string;

    @Column({ name: 'MA_CSKCB', length: 5, nullable: true })
    @Index()
    maCskcb: string;

    @Column({ name: 'HO_TEN', length: 255, nullable: true })
    hoTen: string;

    @Column({ name: 'NGAY_SINH', length: 12, nullable: true })
    ngaySinh: string;

    @Column({ name: 'GIOI_TINH', type: 'int', nullable: true })
    gioiTinh: number;

    @Column({ name: 'DIA_CHI', length: 1024, nullable: true })
    diaChi: string;

    @Column({ name: 'MA_THE_BHYT', nullable: true })
    @Index()
    maTheBhyt: string;

    @Column({ name: 'GT_THE_DEN', nullable: true })
    gtTheDen: string;

    @Column({ name: 'NGAY_VAO', length: 12, nullable: true })
    ngayVao: string;

    @Column({ name: 'NGAY_VAO_NOI_TRU', length: 12, nullable: true })
    ngayVaoNoiTru: string;

    @Column({ name: 'NGAY_RA', length: 12, nullable: true })
    ngayRa: string;

    @Column({ name: 'NGAY_HEN_KL', length: 12, nullable: true })
    ngayHenKl: string;

    @Column({ name: 'CHAN_DOAN_RV', type: 'varchar', length: 4000, nullable: true })
    chanDoanRv: string;

    @Column({ name: 'MA_BENH_CHINH', length: 100, nullable: true })
    @Index()
    maBenhChinh: string;

    @Column({ name: 'MA_BENH_KT', length: 100, nullable: true })
    maBenhKt: string;

    @Column({ name: 'MA_BENH_YHCT', length: 255, nullable: true })
    maBenhYhct: string;

    @Column({ name: 'MA_DOITUONG_KCB', length: 4, nullable: true })
    @Index()
    maDoiTuongKcb: string;

    @Column({ name: 'MA_BACSI', length: 255, nullable: true })
    @Index()
    maBacSi: string;

    @Column({ name: 'MA_TTDV', length: 255, nullable: true })
    @Index()
    maTtdv: string;

    @Column({ name: 'NGAY_CT', length: 12, nullable: true })
    ngayCapGiay: string;

    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
}