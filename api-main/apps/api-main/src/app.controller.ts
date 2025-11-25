import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UtilsService } from '@app/utils';
import { ServiceName } from '@app/shared-constants';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WinstonLoggerService } from '@app/logger';

@ApiTags('API Main')
@Controller('api/v1/main')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly utilsService: UtilsService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext(AppController.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getHello(): string {
    this.logger.debug('Hello endpoint called');
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async healthCheck() {
    this.logger.debug('Health check endpoint called');

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: ServiceName.API_MAIN,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.API_VERSION || '1',
    };

    this.logger.log({
      message: 'Health check performed',
      status: healthData.status,
      uptime: `${Math.floor(healthData.uptime)}s`,
    });

    return healthData;
  }
}
