import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

/**
 * Tạo Winston configuration cho từng service
 * @param serviceName - Tên service (vd: 'auth-service', 'iam-service')
 */
export const createWinstonConfig = (serviceName: string) => {
  // Format cho production - JSON structured logging
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({
      fillExcept: ['message', 'level', 'timestamp', 'label'],
    }),
    winston.format.label({ label: serviceName }),
    winston.format.json(),
  );

  // Format cho development - Console pretty print
  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike(serviceName, {
      colors: true,
      prettyPrint: true,
      processId: true,
      appName: true,
    }),
  );

  const transports: winston.transport[] = [
    // Console transport - luôn bật để xem logs
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
  ];

  // Chỉ ghi file logs trong production hoặc khi LOG_TO_FILE=true
  if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
    transports.push(
      // Error logs - chỉ lỗi
      new winston.transports.File({
        filename: `logs/${serviceName}/error.log`,
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Combined logs - tất cả levels
      new winston.transports.File({
        filename: `logs/${serviceName}/combined.log`,
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    );
  }

  return {
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports,
    // Handle uncaught exceptions
    exceptionHandlers:
      process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true'
        ? [
            new winston.transports.File({
              filename: `logs/${serviceName}/exceptions.log`,
              maxsize: 5242880,
              maxFiles: 5,
            }),
          ]
        : [],
    // Handle unhandled promise rejections
    rejectionHandlers:
      process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true'
        ? [
            new winston.transports.File({
              filename: `logs/${serviceName}/rejections.log`,
              maxsize: 5242880,
              maxFiles: 5,
            }),
          ]
        : [],
    exitOnError: false,
  };
};

