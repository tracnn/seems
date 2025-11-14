import { Module } from '@nestjs/common';
import { SharedGuardsService } from './shared-guards.service';

@Module({
  providers: [SharedGuardsService],
  exports: [SharedGuardsService],
})
export class SharedGuardsModule {}
