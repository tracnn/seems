import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from '@app/utils';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ServiceEnum } from '@app/utils/service.enum';
import { AuthModule } from './auth/auth.module';
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';

@Module({
  imports: [
    // Logger Module - Global logger cho API Gateway
    LoggerModule.forRoot('api-gateway'),
    
    UtilsModule,
    CqrsModule,
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: '.env',
    }),
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
  providers: [AppService],
  exports: [CqrsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply HTTP logger middleware to all routes
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
