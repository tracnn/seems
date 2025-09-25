import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1758805096655 implements MigrationInterface {
    name = 'Update1758805096655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "IDX_a5576d3ebda9444e483160ed99"
        `);
        await queryRunner.query(`
            ALTER TABLE "ROLE_USER" DROP COLUMN "USER_ID"
        `);
        await queryRunner.query(`
            ALTER TABLE "ROLE_USER"
            ADD "USER_ID" varchar2(36) NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2cc07b57f788f46584b9e84c9c"
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_USER" DROP COLUMN "USER_ID"
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_USER"
            ADD "USER_ID" varchar2(36) NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a5576d3ebda9444e483160ed99" ON "ROLE_USER" ("ROLE_ID", "USER_ID")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2cc07b57f788f46584b9e84c9c" ON "PERMISSION_USER" ("PERMISSION_ID", "USER_ID")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "IDX_2cc07b57f788f46584b9e84c9c"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a5576d3ebda9444e483160ed99"
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_USER" DROP COLUMN "USER_ID"
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_USER"
            ADD "USER_ID" number NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2cc07b57f788f46584b9e84c9c" ON "PERMISSION_USER" ("PERMISSION_ID", "USER_ID")
        `);
        await queryRunner.query(`
            ALTER TABLE "ROLE_USER" DROP COLUMN "USER_ID"
        `);
        await queryRunner.query(`
            ALTER TABLE "ROLE_USER"
            ADD "USER_ID" number NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a5576d3ebda9444e483160ed99" ON "ROLE_USER" ("ROLE_ID", "USER_ID")
        `);
    }

}
