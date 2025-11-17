import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IamServiceModule } from './iam-service.module';
import { WinstonLoggerService } from '@app/logger';
import { RpcExceptionFilter } from './presentation/filters/rpc-exception.filter';
import { LogServiceEnum } from '@app/utils/service.enum';

async function bootstrap() {
  // Create pure TCP microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IamServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.IAM_SERVICE_HOST ?? '0.0.0.0',
        port: Number(process.env.IAM_SERVICE_PORT ?? 3003),
      },
    },
  );

  // Use Winston logger
  const logger = app.get(WinstonLoggerService);
  logger.setContext(LogServiceEnum.IAM_SERVICE);
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

  const host = process.env.IAM_SERVICE_HOST ?? '0.0.0.0';
  const port = process.env.IAM_SERVICE_PORT ?? 3003;

  logger.log('🚀 Starting IAM Service (Pure Microservice)...');
  logger.log(`📡 Transport: TCP`);
  logger.log(`🌐 Host: ${host}`);
  logger.log(`🔌 Port: ${port}`);

  await app.listen();

  logger.log('✅ IAM Service is running and listening for TCP messages');
  logger.log('📨 Ready to handle message patterns: iam.*');
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start IAM Service:', error);
  process.exit(1);
});
