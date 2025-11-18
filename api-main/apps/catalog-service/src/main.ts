import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CatalogServiceModule } from './catalog-service.module';
import { WinstonLoggerService } from '@app/logger';
import { RpcExceptionFilter } from './presentation/filters/rpc-exception.filter';
import { LogServiceName } from '@app/shared-constants';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.CATALOG_SERVICE_HOST ?? '0.0.0.0',
        port: Number(process.env.CATALOG_SERVICE_PORT ?? 3002),
      },
    },
  );

  // Use Winston logger
  const logger = app.get(WinstonLoggerService);
  logger.setContext(LogServiceName.CATALOG_SERVICE);
  app.useLogger(logger);

  // Global validation pipe
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

  const host = process.env.CATALOG_SERVICE_HOST ?? '0.0.0.0';
  const port = process.env.CATALOG_SERVICE_PORT ?? 3002;

  logger.log('🚀 Starting Catalog Service (Pure Microservice)...');
  logger.log(`📡 Transport: TCP`);
  logger.log(`🌐 Host: ${host}`);
  logger.log(`🔌 Port: ${port}`);

  await app.listen();

  logger.log('✅ Catalog Service is running and listening for TCP messages');
  logger.log('📨 Ready to handle message patterns: catalog.*');
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start Catalog Service:', error);
  process.exit(1);
});
