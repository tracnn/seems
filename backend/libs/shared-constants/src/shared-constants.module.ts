import { Module } from '@nestjs/common';
import { SharedConstantsService } from './shared-constants.service';

@Module({
  providers: [SharedConstantsService],
  exports: [SharedConstantsService],
})
export class SharedConstantsModule {}
