import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthServiceModule, {
    transport: Transport.TCP,
    options: {
      host: String(process.env.AUTH_SERVICE_HOST ?? '0.0.0.0'),
      port: Number(process.env.AUTH_SERVICE_PORT ?? 3001),
    },
  });

  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');
  logger.debug('Debug message');
  logger.warn('Warning message'); 
  logger.error('Error message');

  await app.listen();
  
  logger.log(`auth-service is running on: ${process.env.AUTH_SERVICE_HOST}:${process.env.AUTH_SERVICE_PORT}`);
}
bootstrap();
