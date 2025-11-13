import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UtilsService } from '@app/utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly utilsService: UtilsService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
