import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML4S')
export class Qd3176Xml4s extends BaseEntity {
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

    @Column({ name: 'MA_CHI_SO', length: 255, nullable: true })
    @Index()
    maChiSo: string;

    @Column({ name: 'TEN_CHI_SO', length: 255, nullable: true })
    tenChiSo: string;

    @Column({ name: 'GIA_TRI', type: 'varchar', length: 1024, nullable: true })
    giaTri: string;

    @Column({ name: 'DON_VI_DO', length: 50, nullable: true })
    donViDo: string;

    @Column({ name: 'MO_TA', type: 'varchar', length: 4000, nullable: true })
    moTa: string;

    @Column({ name: 'KET_LUAN', type: 'varchar', length: 4000, nullable: true })
    ketLuan: string;

    @Column({ name: 'NGAY_KQ', length: 12, nullable: true })
    @Index()
    ngayKq: string;

    @Column({ name: 'MA_BS_DOC_KQ', length: 255, nullable: true })
    @Index()
    maBsDocKq: string;

    @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
    duPhong: string;
} 