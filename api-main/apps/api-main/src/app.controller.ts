import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UtilsService } from '@app/utils';
import { ServiceEnum } from '@app/utils/service.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly utilsService: UtilsService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: ServiceEnum.API_MAIN,
      uptime: process.uptime(),
    };
  }
}
