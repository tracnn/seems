import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_FILTER } from '@nestjs/core';
import { ErrorService } from '@app/shared-exceptions';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import databaseConfig from './infrastructure/config/database.config';

// Application - Command Handlers - Products
import { CreateProductHandler } from './application/use-cases/commands/products/create-product/create-product.handler';
import { UpdateProductHandler } from './application/use-cases/commands/products/update-product/update-product.handler';
import { DeleteProductHandler } from './application/use-cases/commands/products/delete-product/delete-product.handler';

// Application - Query Handlers - Products
import { GetProductsHandler } from './application/use-cases/queries/products/get-products/get-products.handler';
import { GetProductByIdHandler } from './application/use-cases/queries/products/get-product-by-id/get-product-by-id.handler';

// Presentation
import { ProductsController } from './presentation/controllers/products.controller';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';

// Shared
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { ErrorSystem, LogServiceName } from '@app/shared-constants';

const CommandHandlers = [
  // Product Commands
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
];

const QueryHandlers = [
  // Product Queries
  GetProductsHandler,
  GetProductByIdHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    LoggerModule.forRoot(LogServiceName.IAM_SERVICE), // TODO: Update to TEMPLATE_SERVICE when added to shared-constants
    CqrsModule,
    DatabaseModule,
  ],
  controllers: [
    ProductsController,
  ],
  providers: [
    {
      provide: ErrorService,
      useFactory: () => new ErrorService(ErrorSystem.IAM_SERVICE), // TODO: Update to TEMPLATE_SERVICE when added to shared-constants
    },
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [ErrorService],
})
export class TemplateServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}

