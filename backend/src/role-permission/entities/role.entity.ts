import { BaseEntity } from "../../common/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'ROLES' })
export class Role extends BaseEntity {
    @Column({ name: 'NAME', length: 255, unique: true })
    name: string;

    @Column({ name: 'DISPLAY_NAME', length: 255 })
    displayName: string;

    @Column({ name: 'DESCRIPTION', length: 1000 })
    description: string;
}