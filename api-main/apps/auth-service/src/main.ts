import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthServiceModule, {
    transport: Transport.TCP,
    options: {
      host: String(process.env.AUTH_SERVICE_HOST ?? '0.0.0.0'),
      port: Number(process.env.AUTH_SERVICE_PORT ?? 3001),
    },
  });
  await app.listen();
}
bootstrap();
