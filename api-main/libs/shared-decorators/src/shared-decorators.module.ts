import { Module } from '@nestjs/common';
import { SharedDecoratorsService } from './shared-decorators.service';

@Module({
  providers: [SharedDecoratorsService],
  exports: [SharedDecoratorsService],
})
export class SharedDecoratorsModule {}
