import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerOptions } from './common/winston.config';
import { ResponseInterceptor } from './common/response.interceptor';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { json } from 'express';
import { urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonLoggerOptions()),
  });

  // Enable JSON and URL encoded bodies with 100MB limit
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));

  // Use ResponseInterceptor for all responses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Use GlobalHttpExceptionFilter for all exceptions
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Swagger configuration
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';
  if (enableSwagger) {
    const swaggerTitle = process.env.SWAGGER_TITLE || 'XML3176 Hub API';
    const swaggerDesc = process.env.SWAGGER_DESC || 'The XML3176 Hub API documentation';
    const swaggerVersion = process.env.API_VERSION || '1.0';
    const swaggerPrefixDocument = process.env.SWAGGER_PREFIX_DOCUMENT || 'api/v1/docs';
    const config = new DocumentBuilder()
      .setTitle(swaggerTitle)
      .setDescription(swaggerDesc)
      .setVersion(swaggerVersion)
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPrefixDocument, app, document);
  }

  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');
  logger.debug('Debug message');
  logger.warn('Warning message');
  logger.error('Error message');

  await app.listen(process.env.APP_PORT ?? 3000, '0.0.0.0');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
