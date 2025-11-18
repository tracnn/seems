import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'oracle',
    host: process.env.DB_AUTH_HOST || 'localhost',
    port: parseInt(process.env.DB_AUTH_PORT || '1521', 10),
    username: process.env.DB_AUTH_USERNAME || '',
    password: process.env.DB_AUTH_PASSWORD || '',
    serviceName: process.env.DB_AUTH_SERVICE_NAME || 'XE',
    // Import entities trực tiếp thay vì dùng glob pattern
    entities: [RefreshToken],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    // Thêm autoLoadEntities nếu cần
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
    }
  }),
);

