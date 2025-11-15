import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter } from './presentation/filters/rpc-exception.filter';
import { WinstonLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: String(process.env.AUTH_SERVICE_HOST ?? '0.0.0.0'),
        port: Number(process.env.AUTH_SERVICE_PORT ?? 3001),
      },
    },
  );
  
  const logger = app.get(WinstonLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters - sử dụng RPC exception filter cho microservice
  app.useGlobalFilters(new RpcExceptionFilter());

  logger.log('Starting auth-service...');
  logger.log(`Transport: TCP`);
  logger.log(`Host: ${process.env.AUTH_SERVICE_HOST ?? '0.0.0.0'}`);
  logger.log(`Port: ${process.env.AUTH_SERVICE_PORT ?? 3001}`);

  await app.listen();

  logger.log('✅ auth-service is running and listening for messages');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start auth-service:', error);
  process.exit(1);
});
