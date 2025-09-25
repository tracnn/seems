import { Injectable, Logger } from '@nestjs/common';
import { Client, AccessOptions } from 'basic-ftp';
import { Writable } from 'stream';

@Injectable()
export class FtpService {
    private readonly logger = new Logger(FtpService.name);
    async downloadToBuffer(options: AccessOptions, remotePath: string): Promise<Buffer> {
        const client = new Client();
        try {
            await client.access({
                ...options,
                secure: options.secure ?? false,
                secureOptions: options.secureOptions ?? { rejectUnauthorized: false },
            });

            // Custom writable stream to collect data
            const chunks: Buffer[] = [];
            const writable = new Writable({
                write(chunk, encoding, callback) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
                callback();
                }
            });

            await client.downloadTo(writable, remotePath);
            const buffer = Buffer.concat(chunks);
            if (!buffer || buffer.length === 0) throw new Error('Empty buffer received from FTP');
            return buffer;
        } catch (err) {
            this.logger.error(`FTP download error: ${err.message}`, err.stack);
            throw err;
        } finally {
            client.close();
        }
    }
}
