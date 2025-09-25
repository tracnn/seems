import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('QD3176_XML5S')
export class Qd3176Xml5s extends BaseEntity {
  @Column({ type: 'uuid', name: 'XML1_ID' })
  @Index()
  xml1Id: string;

  @Column({ name: 'MA_LK', length: 100 })
  @Index()
  maLk: string;

  @Column({ name: 'STT', type: 'int', nullable: true })
  stt: number;

  @Column({ name: 'DIEN_BIEN_LS', type: 'varchar', length: 4000, nullable: true })
  dienBienLs: string;

  @Column({ name: 'GAIAI_DOAN_BENH', type: 'varchar', length: 4000, nullable: true })
  giaiDoanBenh: string;

  @Column({ name: 'HOI_CHAN', type: 'varchar', length: 4000, nullable: true })
  hoiChan: string;

  @Column({ name: 'PHAU_THUAT', type: 'varchar', length: 4000, nullable: true })
  phauThuat: string;

  @Column({ name: 'THOI_DIEM_DBLS', length: 12, nullable: true })
  @Index()
  thoiDiemDbls: string;

  @Column({ name: 'NGUOI_THUC_HIEN', length: 255, nullable: true })
  @Index()
  nguoiThucHien: string;

  @Column({ name: 'DU_PHONG', type: 'varchar', length: 4000, nullable: true })
  duPhong: string;
} 
