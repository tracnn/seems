import { Module } from '@nestjs/common';
import { CalatogServiceController } from './calatog-service.controller';
import { CalatogServiceService } from './calatog-service.service';

@Module({
  imports: [],
  controllers: [CalatogServiceController],
  providers: [CalatogServiceService],
})
export class CalatogServiceModule {}
