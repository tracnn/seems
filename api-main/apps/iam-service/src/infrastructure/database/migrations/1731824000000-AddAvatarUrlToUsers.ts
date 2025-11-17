import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Add AVATAR_URL column to USERS table
 * Date: 2025-11-17
 */
export class AddAvatarUrlToUsers1731824000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const table = await queryRunner.getTable('USERS');
    const avatarUrlColumn = table?.findColumnByName('AVATAR_URL');

    if (!avatarUrlColumn) {
      await queryRunner.addColumn(
        'USERS',
        new TableColumn({
          name: 'AVATAR_URL',
          type: 'varchar2',
          length: '500',
          isNullable: true,
          comment: 'User avatar/profile picture URL',
        }),
      );

      console.log('✅ Added AVATAR_URL column to USERS table');
    } else {
      console.log('ℹ️  AVATAR_URL column already exists in USERS table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('USERS');
    const avatarUrlColumn = table?.findColumnByName('AVATAR_URL');

    if (avatarUrlColumn) {
      await queryRunner.dropColumn('USERS', 'AVATAR_URL');
      console.log('✅ Dropped AVATAR_URL column from USERS table');
    }
  }
}

