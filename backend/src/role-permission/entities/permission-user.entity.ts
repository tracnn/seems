import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/base.entity";
import { Permission } from "./permission.entity";

@Entity({ name: 'PERMISSION_USER' })
@Index(['permissionId', 'userId'], { unique: true })
export class PermissionUser extends BaseEntity {
    @Column({ name: 'PERMISSION_ID', length: 36 })
    permissionId: string;

    @Column({ name: 'USER_ID' })
    userId: number;

    @ManyToOne(() => Permission)
    @JoinColumn({ name: 'PERMISSION_ID' })
    permission: Permission;
}