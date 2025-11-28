import { DynamicModule, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './config/winston.config';
import { WinstonLoggerService } from './winston-logger.service';

/**
 * Logger Module cho toàn bộ monorepo
 *
 * Cách sử dụng trong service:
 *
 * @Module({
 *   imports: [
 *     LoggerModule.forRoot('auth-service'),
 *     // ... other imports
 *   ],
 * })
 * export class AuthServiceModule {}
 */
@Module({})
export class LoggerModule {
  /**
   * Khởi tạo Logger module với service name
   * @param serviceName - Tên của service (vd: 'auth-service', 'iam-service')
   * @returns DynamicModule
   */
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        // Khởi tạo WinstonModule với config tương ứng với service
        WinstonModule.forRoot(createWinstonConfig(serviceName)),
      ],
      providers: [WinstonLoggerService],
      exports: [WinstonLoggerService],
      global: true, // Make logger available globally trong service
    };
  }
}
