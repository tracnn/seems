import { Controller, Get } from '@nestjs/common';
import { CalatogServiceService } from './calatog-service.service';

@Controller()
export class CalatogServiceController {
  constructor(private readonly calatogServiceService: CalatogServiceService) {}

  @Get()
  getHello(): string {
    return this.calatogServiceService.getHello();
  }
}
