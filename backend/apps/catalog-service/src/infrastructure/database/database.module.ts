import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';

/**
 * Database Module for Catalog Service
 *
 * TODO: Import entities và repositories khi đã tạo
 *
 * Example:
 * import { Catalog } from '../../domain/entities/catalog.entity';
 * import { CatalogRepository } from './typeorm/repositories/catalog.repository';
 */

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return config;
      },
      inject: [ConfigService],
    }),
    // TODO: Thêm entities khi đã tạo
    // TypeOrmModule.forFeature([Catalog]),
  ],
  providers: [
    // TODO: Thêm repositories khi đã tạo
    // CatalogRepository,
    // {
    //   provide: 'ICatalogRepository',
    //   useClass: CatalogRepository,
    // },
  ],
  exports: [
    // TODO: Export repositories khi đã tạo
    // CatalogRepository,
    // 'ICatalogRepository',
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
