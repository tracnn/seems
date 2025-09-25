import { ERROR_400 } from "@common/error-messages/error-400";
import { BadRequestException, Injectable } from "@nestjs/common";
import { parseStringPromise, Parser } from 'xml2js';
import { CommandBus } from "@nestjs/cqrs";
import { CreateFullXmlRecordCommand } from "../commands/create-full-xml-record.command";
import { snakeUpperToCamel } from "../utils/snake-upper-to-camel.utils";

@Injectable()
export class XmlImportService {  
  constructor(private readonly commandBus: CommandBus) {}

  async processXmlFiles(files: Express.Multer.File[], importSessionId: string, userId: string) {
    const results: any[] = [];

    for (const file of files) {
      const xml = await parseStringPromise(file.buffer.toString('utf8'), { explicitArray: false });

      if (!xml.GIAMDINHHS) {
        throw new BadRequestException(ERROR_400.INVALID_XML_3176_FILE);
      }

      const filePayloads: { [key: string]: any } = {};
      const fileXmlsRaw = xml.GIAMDINHHS?.THONGTINHOSO?.DANHSACHHOSO?.HOSO?.FILEHOSO;
      const fileXmls = Array.isArray(fileXmlsRaw) ? fileXmlsRaw : [fileXmlsRaw];

      for (const fileXml of fileXmls) {
        const type = fileXml.LOAIHOSO;
        const base64 = fileXml.NOIDUNGFILE;
        const decoded = Buffer.from(base64, 'base64').toString('utf-8');

        const parsed = await parseStringPromise(decoded, { explicitArray: false });
        const rootKey = Object.keys(parsed)[0];
        const normalized = snakeUpperToCamel(parsed[rootKey]);

        filePayloads[type] = normalized;
      }

      const result = await this.commandBus.execute(new CreateFullXmlRecordCommand(filePayloads, importSessionId, userId));
      results.push({ fileName: file.originalname, result });
    }

    return {
      success: true,
      totalFiles: files.length,
      results,
    };
  }
}