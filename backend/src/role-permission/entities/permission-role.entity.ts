import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/base.entity";
import { Permission } from "./permission.entity";
import { Role } from "./role.entity";

@Entity({ name: 'PERMISSION_ROLE' })
@Index(['permissionId', 'roleId'], { unique: true })
export class PermissionRole extends BaseEntity {
    @Column({ name: 'PERMISSION_ID', length: 36 })
    permissionId: string;

    @Column({ name: 'ROLE_ID', length: 36 })
    roleId: string;

    @ManyToOne(() => Permission)
    @JoinColumn({ name: 'PERMISSION_ID' })
    permission: Permission;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'ROLE_ID' })
    role: Role;
}