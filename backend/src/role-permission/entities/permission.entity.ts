import { BaseEntity } from "../../common/base.entity";
import { Column, Entity, Index } from "typeorm";
import { PermissionType } from "../enums/permission.enum";

@Entity({ name: 'PERMISSIONS' })
export class Permission extends BaseEntity {
    @Column({ name: 'NAME', length: 255, unique: true })
    name: string;

    @Column({ name: 'DISPLAY_NAME', length: 255 })
    displayName: string;

    @Column({ name: 'DESCRIPTION', length: 1000 })
    description: string;

    @Column({ name: 'TYPE', length: 20 })
    @Index()
    type: PermissionType;
}