import { NestFactory } from '@nestjs/core';
import { CalatogServiceModule } from './calatog-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CalatogServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
