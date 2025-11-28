import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TemplateServiceModule } from './template-service.module';
import { WinstonLoggerService } from '@app/logger';
import { RpcExceptionFilter } from './presentation/filters/rpc-exception.filter';
import { LogServiceName } from '@app/shared-constants';

async function bootstrap() {
  // Create pure TCP microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TemplateServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.TEMPLATE_SERVICE_HOST ?? '0.0.0.0',
        port: Number(process.env.TEMPLATE_SERVICE_PORT ?? 4004),
      },
    },
  );

  // Use Winston logger
  const logger = app.get(WinstonLoggerService);
  logger.setContext(LogServiceName.IAM_SERVICE); // TODO: Update to TEMPLATE_SERVICE when added to shared-constants
  app.useLogger(logger);

  // Global validation pipe - relaxed for TCP microservice
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra fields for TCP flexibility
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      skipMissingProperties: true, // Don't validate missing optional properties
    }),
  );

  // Global RPC exception filter
  app.useGlobalFilters(new RpcExceptionFilter());

  const host = process.env.TEMPLATE_SERVICE_HOST ?? '0.0.0.0';
  const port = process.env.TEMPLATE_SERVICE_PORT ?? 4004;

  logger.log('🚀 Starting Template Service (Pure Microservice)...');
  logger.log(`📡 Transport: TCP`);
  logger.log(`🌐 Host: ${host}`);
  logger.log(`🔌 Port: ${port}`);

  await app.listen();

  logger.log('✅ Template Service is running and listening for TCP messages');
  logger.log('📨 Ready to handle message patterns: template.*');
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start Template Service', error);
  process.exit(1);
});

