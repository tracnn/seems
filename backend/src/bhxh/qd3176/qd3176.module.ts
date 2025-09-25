import { Module } from '@nestjs/common';
import { Qd3176Service } from './qd3176.service';
import { Qd3176Controller } from './qd3176.controller';
import { Qd3176Xml1s } from './entities/qd3176-xml1s.entity';
import { Qd3176Xml2s } from './entities/qd3176-xml2s.entity';
import { Qd3176Xml3s } from './entities/qd3176-xml3s.entity';
import { Qd3176Xml4s } from './entities/qd3176-xml4s.entity';
import { Qd3176Xml14s } from './entities/qd3176-xml14s.entity';
import { Qd3176Xml15s } from './entities/qd3176-xml15s.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BASE_SCHEMA } from '../../constants/common.constant';
import { CqrsModule } from '@nestjs/cqrs';
import { Qd3176Xml6s } from './entities/qd3176-xml6s.entity';
import { Qd3176Xml5s } from './entities/qd3176-xml5s.entity';
import { Qd3176Xml8s } from './entities/qd3176-xml8s.entity';
import { Qd3176Xml9s } from './entities/qd3176-xml9s.entity';
import { Qd3176Xml10s } from './entities/qd3176-xml10s.entity';
import { Qd3176Xml11s } from './entities/qd3176-xml11s.entity';
import { Qd3176Xml12s } from './entities/qd3176-xml12s.entity';
import { Qd3176Xml13s } from './entities/qd3176-xml13s.entity';
import { Qd3176Xml7s } from './entities/qd3176-xml7s.entity';
import { XmlImportService } from './services/xml-import.service';
import { CreateFullXmlRecordHandler } from './commands/create-full-xml-record.handler';
import { GetXml1sByKeywordHandler } from './queries/get-xml1s-by-keyword.handler';
import { GetXml2sByXml1IdHandler } from './queries/get-xml2s-by-xml1-id.handler';
import { GetXml3sByXml1IdHandler } from './queries/get-xml3s-by-xml1-id.handler';
import { GetXml4sByXml1IdHandler } from './queries/get-xml4s-by-xml1-id.handler';
import { UpdateXml1sByKeyHandler } from './commands/update-xml1s-by-key.handler';
import { XmlPollingImportService } from './services/xml-polling-import.service';
import { BullModule } from '@nestjs/bull';
import { QD3176_XML_IMPORT_QUEUE } from '../enums/qd3176.enum';
import { XmlImportProducer } from './producers/xml-import.producer';
import { XmlImportProcessor } from './processors/xml-import.processor';
import { registerExtendedRepo } from '../../common/base.repository.provider';
import { Qd3176Xml1sRepository } from './repositories/qd3176-xml1s.repository';
import { Qd3176Xml2sRepository } from './repositories/qd3176-xml2s.repository';
import { Qd3176Xml3sRepository } from './repositories/qd3176-xml3s.repository';
import { Qd3176Xml4sRepository } from './repositories/qd3176-xml4s.repository';

const CommandHandlers = [
  CreateFullXmlRecordHandler,
  UpdateXml1sByKeyHandler
];

const QueryHandlers = [
  GetXml1sByKeywordHandler, 
  GetXml2sByXml1IdHandler,
  GetXml3sByXml1IdHandler,
  GetXml4sByXml1IdHandler
];

const registerRepositories = [
  registerExtendedRepo(Qd3176Xml1s, Qd3176Xml1sRepository, 'Qd3176Xml1sRepository', BASE_SCHEMA.DEFAULT),
  registerExtendedRepo(Qd3176Xml2s, Qd3176Xml2sRepository, 'Qd3176Xml2sRepository', BASE_SCHEMA.DEFAULT),
  registerExtendedRepo(Qd3176Xml3s, Qd3176Xml3sRepository, 'Qd3176Xml3sRepository', BASE_SCHEMA.DEFAULT),
  registerExtendedRepo(Qd3176Xml4s, Qd3176Xml4sRepository, 'Qd3176Xml4sRepository', BASE_SCHEMA.DEFAULT),
];

@Module({
  imports: [CqrsModule,
    BullModule.registerQueue({
      name: QD3176_XML_IMPORT_QUEUE.XML_IMPORT,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    TypeOrmModule.forFeature(
      [Qd3176Xml1s, Qd3176Xml2s, Qd3176Xml3s, 
        Qd3176Xml4s, Qd3176Xml5s, Qd3176Xml6s, 
        Qd3176Xml7s, Qd3176Xml8s, Qd3176Xml9s, 
        Qd3176Xml10s, Qd3176Xml11s, Qd3176Xml12s, 
        Qd3176Xml13s, Qd3176Xml14s, Qd3176Xml15s], BASE_SCHEMA.DEFAULT)
  ],
  controllers: [Qd3176Controller],
  providers: [
    Qd3176Service, 
    XmlImportService, 
    XmlPollingImportService,
    XmlImportProducer,
    XmlImportProcessor,
    ...CommandHandlers, 
    ...QueryHandlers,
    ...registerRepositories],
  exports: [CqrsModule],
})
export class Qd3176Module {}
