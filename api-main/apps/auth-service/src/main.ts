import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';

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

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  const logger = new Logger('Bootstrap');
  logger.log('Starting auth-service...');

  await app.listen();

  logger.log(
    `auth-service is running on: ${process.env.AUTH_SERVICE_HOST}:${process.env.AUTH_SERVICE_PORT}`,
  );
}
bootstrap();
