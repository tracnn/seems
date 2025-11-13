import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));

  // Enable CORS
  app.enableCors();

  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';
  if (enableSwagger) {
    const swaggerTitle = process.env.SWAGGER_TITLE || 'App Microservice SEEMS Hub API';
    const swaggerDesc = process.env.SWAGGER_DESC || 'The App Microservice SEEMS Hub API documentation';
    const swaggerVersion = process.env.SWAGGER_VERSION || '1.0';
    const swaggerPrefix = process.env.SWAGGER_PREFIX || 'api/v1/docs';
    const config = new DocumentBuilder()
      .setTitle(swaggerTitle)
      .setDescription(swaggerDesc)
      .setVersion(swaggerVersion)
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPrefix, app, document);
  }

  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');
  logger.debug('Debug message');
  logger.warn('Warning message');
  logger.error('Error message');

  await app.listen(process.env.API_MAIN_PORT ?? 3000, '0.0.0.0');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();