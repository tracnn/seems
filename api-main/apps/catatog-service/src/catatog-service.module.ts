import { Module } from '@nestjs/common';
import { CatalogServiceController } from './catatog-service.controller';
import { CatalogServiceService } from './catatog-service.service';

@Module({
  imports: [],
  controllers: [CatalogServiceController],
  providers: [CatalogServiceService],
})
export class CatalogServiceModule {}
