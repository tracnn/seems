import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { XmlImportService } from './xml-import.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mime from 'mime-types';
import { randomUUID } from 'crypto';

@Injectable()
export class XmlPollingImportService implements OnModuleInit {
    private readonly logger = new Logger(XmlPollingImportService.name);
    private readonly watchDir = './xml3176-folder';
    private readonly processedDir = path.join(this.watchDir, 'processed');
    private readonly errorDir = path.join(this.watchDir, 'errors');
    private readonly intervalMs = 10000;
    private isRunning = false;
    
    constructor(private readonly xmlImportService: XmlImportService) {}

    async onModuleInit() {
        await this.ensureDirectories();
        setInterval(() => this.scanAndProcessFiles(), this.intervalMs);
    }

    private async ensureDirectories() {
        await fs.mkdir(this.processedDir, { recursive: true });
        await fs.mkdir(this.errorDir, { recursive: true });
    }

    private async scanAndProcessFiles() {
        if (this.isRunning) return; // tránh chạy trùng
        this.isRunning = true;

        const importSessionId = randomUUID();

        try {
            const files = await fs.readdir(this.watchDir);
            const xmlFiles = files.filter(f => f.endsWith('.xml'));

            for (const fileName of xmlFiles) {
                const filePath = path.join(this.watchDir, fileName);
                const lockFile = filePath + '.lock';

                if (await this.isLocked(lockFile)) continue;
                if (!(await this.isFileStableByTime(filePath))) continue;

                await fs.writeFile(lockFile, 'processing');
                try {
                    const fileBuffer = await fs.readFile(filePath);
                    const file = {
                        originalname: fileName,
                        buffer: fileBuffer,
                        mimetype: mime.lookup(fileName) || 'application/xml',
                    } as Express.Multer.File;

                    await this.xmlImportService.processXmlFiles([file], importSessionId, importSessionId);

                    this.logger.log(`✅ Import thành công: ${fileName}`);
                    await fs.rename(filePath, path.join(this.processedDir, fileName));
                } catch (err) {
                    this.logger.error(`❌ Lỗi khi xử lý ${fileName}: ${err.message}`);
                    await fs.rename(filePath, path.join(this.errorDir, fileName));
                } finally {
                    await fs.unlink(lockFile).catch(() => {});
                }
            }
        } catch (err) {
            this.logger.error(`❌ Lỗi quét thư mục: ${err.message}`);
        } finally {
            this.isRunning = false;
        }
    }

    private async isLocked(lockFile: string): Promise<boolean> {
        const exists = await fs.access(lockFile).then(() => true).catch(() => false);
        if (!exists) return false;
    
        try {
            const stats = await fs.stat(lockFile);
            const now = Date.now();
            const age = now - stats.mtimeMs;
    
        if (age > 5 * 60 * 1000) { // > 5 phút
            await fs.unlink(lockFile);
            this.logger.warn(`⏱️ Lock hết hạn, đã xoá: ${path.basename(lockFile)}`);
            return false;
        }
    
        this.logger.warn(`🔒 Đang bị khóa: ${path.basename(lockFile)} (${Math.round(age / 1000)}s)`);
            return true;
        } catch (err) {
            this.logger.error(`⚠️ Không đọc được lock file: ${lockFile} - ${err.message}`);
            return true; // phòng trường hợp lỗi khi stat
        }
    }

    private async isFileStableByTime(filePath: string): Promise<boolean> {
        try {
        const stats = await fs.stat(filePath);
        const now = Date.now();
        const lastModified = stats.mtimeMs;
        const stable = now - lastModified > 3000;
        if (!stable) {
            this.logger.warn(`⏳ File chưa ổn định: ${path.basename(filePath)}`);
        }
            return stable;
        } catch {
            return false;
        }
    }
}