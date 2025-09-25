import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Đảm bảo thư mục logs tồn tại
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Format cho file logs
const fileFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
);

// Format cho console
const consoleFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    nestWinstonModuleUtilities.format.nestLike('XML3176-BACKEND', {
        prettyPrint: true,
        colors: true,
    }),
);

export const createWinstonLoggerOptions = () => ({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // Info log file
        new winston.transports.File({
            filename: path.join(logDir, 'info.log'),
            level: 'info',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            format: fileFormat,
        }),
        // Warn log file
        new winston.transports.File({
            filename: path.join(logDir, 'warn.log'),
            level: 'warn',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            format: fileFormat,
        }),
        // Error log file
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            format: fileFormat,
        }),
        // Combined log file (all levels)
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            format: fileFormat,
        }),
    ],
}); 