import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';

// Entities
import { Product } from '../../domain/entities/product.entity';

// Repositories
import { ProductRepository } from './typeorm/repositories/product.repository';

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
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [
    ProductRepository,
    // Provide with interface token
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: [
    ProductRepository,
    'IProductRepository',
    TypeOrmModule,
  ],
})
export class DatabaseModule {}

