import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { CatalogServiceController } from './catalog-service.controller';
import { CatalogServiceService } from './catalog-service.service';
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { LogServiceName } from '@app/shared-constants';

// Command Handlers (sẽ được thêm sau khi có use cases)
const CommandHandlers: any[] = [];

// Query Handlers (sẽ được thêm sau khi có use cases)
const QueryHandlers: any[] = [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(LogServiceName.CATALOG_SERVICE),
    CqrsModule,
    // DatabaseModule sẽ được thêm sau khi có entities
  ],
  controllers: [CatalogServiceController],
  providers: [CatalogServiceService, ...CommandHandlers, ...QueryHandlers],
})
export class CatalogServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
