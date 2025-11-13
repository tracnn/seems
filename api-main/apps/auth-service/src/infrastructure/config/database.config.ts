import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'oracle',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1521', 10),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    serviceName: process.env.DB_SERVICE_NAME || 'XE',
    entities: [__dirname + '/../../domain/entities/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    extra: {
      connectionLimit: 10,
    },
  }),
);

