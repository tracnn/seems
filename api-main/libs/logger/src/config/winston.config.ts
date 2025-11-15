import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { SeqTransport } from '@datalust/winston-seq';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Tạo Winston configuration cho từng service
 * @param serviceName - Tên service (vd: 'auth-service', 'iam-service')
 */
export const createWinstonConfig = (serviceName: string) => {
  // Đảm bảo thư mục logs tồn tại
  const logDir = path.join(process.cwd(), 'logs', serviceName);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  // Format cho file logs - JSON structured logging
  const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  );

  // Format cho production logs
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
      // Info log file
      new winston.transports.File({
        filename: path.join(logDir, 'info.log'),
        level: 'info',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        format: fileFormat,
      }),
      // Warn log file
      new winston.transports.File({
        filename: path.join(logDir, 'warn.log'),
        level: 'warn',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        format: fileFormat,
      }),
      // Error log file
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        format: fileFormat,
      }),
      // Combined logs - tất cả levels
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        format: fileFormat,
      }),
    );
  }

  // Thêm Seq transport nếu có cấu hình
  if (process.env.SEQ_SERVER_URL) {
    try {
      transports.push(
        new SeqTransport({
          serverUrl: process.env.SEQ_SERVER_URL,
          apiKey: process.env.SEQ_API_KEY,
          onError: (e: any) => {
            console.error('[SEQ Transport Error]:', e);
          },
          handleExceptions: true,
          handleRejections: true,
        }),
      );
      console.log(`[${serviceName}] Seq logging enabled: ${process.env.SEQ_SERVER_URL}`);
    } catch (error) {
      console.warn(`[${serviceName}] Failed to initialize Seq transport:`, error);
    }
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

