import { Module } from '@nestjs/common';
import { SharedRmqService } from './shared-rmq.service';

@Module({
  providers: [SharedRmqService],
  exports: [SharedRmqService],
})
export class SharedRmqModule {}
