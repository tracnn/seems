import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from '@app/utils';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { LogServiceEnum, ServiceEnum } from '@app/utils/service.enum';
import { AuthModule } from './auth/auth.module';
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    UtilsModule,
    CqrsModule,
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(LogServiceEnum.API_MAIN),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
    AuthModule,
    ClientsModule.register([
      {
        name: ServiceEnum.CATALOG_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.CATALOG_SERVICE_HOST ?? '0.0.0.0',
          port: Number(process.env.CATALOG_SERVICE_PORT ?? 3002),
        },
      },
      {
        name: ServiceEnum.IAM_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.IAM_SERVICE_HOST ?? '0.0.0.0',
          port: Number(process.env.IAM_SERVICE_PORT ?? 3003),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [CqrsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
