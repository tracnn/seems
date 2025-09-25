import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { QD3176_XML_IMPORT_QUEUE, QD3176_XML_IMPORT_JOB } from '../../enums/qd3176.enum';

@Injectable()
export class XmlImportProducer {
  private readonly logger = new Logger(XmlImportProducer.name);

  constructor(
    @InjectQueue(QD3176_XML_IMPORT_QUEUE.XML_IMPORT)
    private readonly queue: Queue
  ) {}

  private async ensureDir(dir: string) {
    await fsp.mkdir(dir, { recursive: true });
  }

  // Loại bỏ ký tự nguy hiểm và chỉ giữ basename
  private sanitizeName(name: string): string {
    const base = path.basename(name);
    // Thay ký tự không hợp lệ trên Windows và các hệ khác
    return base.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 200);
  }

  private async saveFileToDisk(
    f: Express.Multer.File,
    targetPath: string
  ): Promise<void> {
    // Nếu có buffer (memoryStorage)
    if (f.buffer && f.buffer.length > 0) {
      await fsp.writeFile(targetPath, f.buffer);
      return;
    }
    // Nếu Multer dùng diskStorage, dùng f.path
    if ((f as any).path && typeof (f as any).path === 'string') {
      // Dùng stream để tránh dùng nhiều RAM
      await pipeline(createReadStream((f as any).path), createWriteStream(targetPath));
      return;
    }
    throw new Error('Không tìm thấy dữ liệu file (buffer/path) từ Multer.');
  }

  async enqueueFiles(
    files: Express.Multer.File[],
    importSessionId: string,
    userId: string
  ) {
    this.logger.log(
      `Enqueuing ${files.length} files for import session ${importSessionId} by user ${userId}`
    );

    // Dùng thư mục tạm tương thích mọi hệ điều hành
    const baseTmp = os.tmpdir(); // ví dụ: C:\Users\<user>\AppData\Local\Temp trên Windows, /tmp trên Linux
    const baseDir = path.join(baseTmp, 'qd3176-import', importSessionId);
    await this.ensureDir(baseDir);

    const jobIds: string[] = [];

    for (const f of files) {
      try {
        const fileId = randomUUID();
        const safeName = this.sanitizeName(f.originalname || 'uploaded.xml');
        const diskPath = path.join(baseDir, `${fileId}__${safeName}`);

        await this.saveFileToDisk(f, diskPath);

        const job = await this.queue.add(
          QD3176_XML_IMPORT_JOB.PARSE_AND_CREATE,
          { diskPath, originalName: safeName, importSessionId, userId },
          {
            jobId: `${importSessionId}:${fileId}`, // id duy nhất để tránh enqueue trùng
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: true,
            priority: 5,
          },
        );
        jobIds.push(String(job.id));
      } catch (err: any) {
        this.logger.error(
          `Lỗi khi lưu/enqueue file "${f?.originalname}": ${err?.message}`,
          err?.stack
        );
        // Có thể tiếp tục các file khác thay vì throw toàn bộ
      }
    }

    // Thêm job finalize nếu có ít nhất 1 file enqueue thành công
    if (jobIds.length > 0) {
      await this.queue.add(
        QD3176_XML_IMPORT_JOB.SESSION_FINALIZE,
        { importSessionId },
        { delay: 1000, removeOnComplete: true, removeOnFail: true },
      );
    } else {
      this.logger.warn(
        `Không có file nào được enqueue thành công cho session ${importSessionId}`
      );
    }

    this.logger.log(
      `Enqueued ${jobIds.length}/${files.length} files for import session ${importSessionId} by user ${userId}`
    );
    return { jobCount: jobIds.length, jobIds };
  }
}