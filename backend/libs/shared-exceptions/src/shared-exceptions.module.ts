import { Module } from '@nestjs/common';
import { SharedExceptionsService } from './shared-exceptions.service';

@Module({
  providers: [SharedExceptionsService],
  exports: [SharedExceptionsService],
})
export class SharedExceptionsModule {}
