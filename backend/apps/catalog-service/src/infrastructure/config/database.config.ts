import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database Configuration for Catalog Service
 *
 * TODO: Import entities khi đã tạo
 * import { Catalog } from '../../domain/entities/catalog.entity';
 */
export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'oracle',
    host: process.env.DB_CATALOG_HOST || 'localhost',
    port: parseInt(process.env.DB_CATALOG_PORT || '1521', 10),
    username: process.env.DB_CATALOG_USERNAME || '',
    password: process.env.DB_CATALOG_PASSWORD || '',
    serviceName: process.env.DB_CATALOG_SERVICE_NAME || 'XE',
    // TODO: Import entities trực tiếp khi đã tạo
    // entities: [Catalog],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
    extra: {
      poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
      poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
      poolIncrement: parseInt(process.env.DB_POOL_INCREMENT || '2', 10),
      connectTimeout: 60000,
      poolTimeout: 60000,
      queueTimeout: 60000,
      poolPingInterval: 60,
      stmtCacheSize: 30,
      enableConnectionValidation: true,
    },
  }),
);
