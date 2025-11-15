import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { WinstonLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Winston Logger
  const logger = app.get(WinstonLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));

  // Enable CORS
  app.enableCors();
  logger.log('CORS enabled');

  // Global validation pipe
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
  logger.log('Global validation pipe configured');

  // Swagger Configuration
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';
  if (enableSwagger) {
    const swaggerTitle = process.env.SWAGGER_TITLE || 'App Microservice SEEMS Hub API';
    const swaggerDesc = process.env.SWAGGER_DESC || 'The App Microservice SEEMS Hub API documentation';
    const swaggerVersion = process.env.SWAGGER_VERSION || '1.0.0';
    const swaggerPrefix = process.env.SWAGGER_PREFIX || 'api/v1/docs';
    
    const config = new DocumentBuilder()
      .setTitle(swaggerTitle)
      .setDescription(swaggerDesc)
      .setVersion(swaggerVersion)
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPrefix, app, document);
    
    logger.log(`Swagger documentation available at: /${swaggerPrefix}`);
  }

  const port = process.env.API_MAIN_PORT ?? 4000;
  const host = '0.0.0.0';
  
  await app.listen(port, host);
  
  logger.log(`🚀 API Gateway is running on: ${await app.getUrl()}`);
  logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`📊 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});