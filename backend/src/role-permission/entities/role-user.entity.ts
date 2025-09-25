import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "../../common/base.entity";

@Entity({ name: 'ROLE_USER' })
@Index(['roleId', 'userId'], { unique: true })
export class RoleUser extends BaseEntity {
    @Column({ name: 'ROLE_ID', length: 36 })
    roleId: string;

    @Column({ name: 'USER_ID', length: 36 })
    userId: string;
}