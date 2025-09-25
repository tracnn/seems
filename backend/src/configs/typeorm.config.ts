import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BASE_SCHEMA, DB_TYPE } from '../constants/common.constant';
import { buildOracleConnectString } from './build-oracle-connection-string.config';

export const createTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST') || 'localhost';
  const port = configService.get<string>('DB_PORT') || '1521';
  const sid = configService.get<string>('DB_SID');
  const serviceName = configService.get<string>('DB_SERVICE_NAME');

  return {
    name: BASE_SCHEMA.DEFAULT,
    type: DB_TYPE.ORACLE as any,
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    connectString: buildOracleConnectString(host, port, sid, serviceName),
    autoLoadEntities: true,
    synchronize: false,
  };
};