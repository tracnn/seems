import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import { CommandBus } from '@nestjs/cqrs';
import { CreateFullXmlRecordCommand } from '../commands/create-full-xml-record.command';
import { snakeUpperToCamel } from '../utils/snake-upper-to-camel.utils';
import { QD3176_XML_IMPORT_JOB, QD3176_XML_IMPORT_QUEUE } from '../../enums/qd3176.enum';

@Processor(QD3176_XML_IMPORT_QUEUE.XML_IMPORT)
@Injectable()
export class XmlImportProcessor {
    private readonly logger = new Logger(XmlImportProcessor.name);

    constructor(
        private readonly commandBus: CommandBus,
    ) {}

    @Process({ name: QD3176_XML_IMPORT_JOB.PARSE_AND_CREATE, concurrency: 2 })
    async handle(job: Job<{ diskPath: string; originalName: string; importSessionId: string; userId: string }>) {
        const { diskPath, originalName, importSessionId, userId } = job.data;
        this.logger.log(`Processing file ${originalName} for import session ${importSessionId} by user ${userId}`);

        try {
            const content = await fs.readFile(diskPath, 'utf8');
            const xml = await parseStringPromise(content, { explicitArray: false });
            if (!xml?.GIAMDINHHS) throw new BadRequestException('INVALID_XML_3176_FILE');

            const filePayloads: Record<string, any> = {};
            const fileXmlsRaw = xml.GIAMDINHHS?.THONGTINHOSO?.DANHSACHHOSO?.HOSO?.FILEHOSO;

            if (!fileXmlsRaw) {
                this.logger.warn(`No FILEHOSO in ${originalName} (session=${importSessionId}, job=${job.id})`);
              }            

            const fileXmls = Array.isArray(fileXmlsRaw) ? fileXmlsRaw : (fileXmlsRaw ? [fileXmlsRaw] : []);
            const totalParts = Math.max(fileXmls.length, 1);

            let i = 0;
            for (const f of fileXmls) {
                i++;
                await job.progress(Math.round((i / totalParts) * 80)); // 0–80%

                const type = f.LOAIHOSO;
                const b64 = f?.NOIDUNGFILE;

                if (!type) {
                    this.logger.warn(`Missing LOAIHOSO in a FILEHOSO (session=${importSessionId}, job=${job.id})`);
                    continue;
                  }
                  if (!b64 || typeof b64 !== 'string') {
                    this.logger.warn(`Missing/invalid NOIDUNGFILE for type=${type} (session=${importSessionId}, job=${job.id})`);
                    continue;
                  }
                
                  let decoded: string;
                  try {
                    decoded = Buffer.from(b64, 'base64').toString('utf-8');
                  } catch (e) {
                    this.logger.error(`Base64 decode failed for type=${type} (session=${importSessionId}, job=${job.id})`, e as any);
                    continue;
                  }

                const parsed = await parseStringPromise(decoded, { explicitArray: false });
                const rootKeys = Object.keys(parsed || {});
                if (rootKeys.length === 0) {
                    this.logger.warn(`Empty parsed XML for type=${type} (session=${importSessionId}, job=${job.id})`);
                    continue;
                }

                const rootKey = rootKeys[0];

                const normalized = snakeUpperToCamel(parsed[rootKey]);
                filePayloads[type] = normalized;
            }

            const result = await this.commandBus.execute(new CreateFullXmlRecordCommand(filePayloads, importSessionId, userId));
            await job.progress(100);
            this.logger.log(`Successfully processed ${originalName} (session=${importSessionId}, job=${job.id})`);

            return { fileName: originalName, result };
        } catch (err) {
            this.logger.error(
                `Job failed (session=${importSessionId}, job=${job.id}, file=${originalName}): ${err?.message || err}`,
            );
            throw err;
        } finally {
            try { await fs.unlink(diskPath); } catch {}
        }
    }

    @Process(QD3176_XML_IMPORT_JOB.SESSION_FINALIZE)
    async finalize(job: Job<{ importSessionId: string }>) {
        this.logger.log(`Finalize session ${job.data.importSessionId}`);
    }
}