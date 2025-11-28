import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../../domain/entities/product.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'oracle',
    host: process.env.DB_TEMPLATE_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(
      process.env.DB_TEMPLATE_PORT || process.env.DB_PORT || '1521',
      10,
    ),
    username: process.env.DB_TEMPLATE_USERNAME || process.env.DB_USERNAME || '',
    password: process.env.DB_TEMPLATE_PASSWORD || process.env.DB_PASSWORD || '',
    serviceName:
      process.env.DB_TEMPLATE_SERVICE_NAME || process.env.DB_SERVICE_NAME || 'XE',
    // Import entities trực tiếp
    entities: [Product],
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

