import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from '@app/utils';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ErrorSystem, LogServiceName, ServiceName } from '@app/shared-constants';
import { AuthModule } from './auth/auth.module';
import { IamModule } from './iam/iam.module';
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { ErrorService } from '@app/shared-exceptions';

@Module({
  imports: [
    UtilsModule,
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(LogServiceName.API_MAIN),
    AuthModule,
    IamModule, // IAM Module includes IAM_SERVICE TCP client
    ClientsModule.register([
      {
        name: ServiceName.CATALOG_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.CATALOG_SERVICE_HOST ?? '0.0.0.0',
          port: Number(process.env.CATALOG_SERVICE_PORT ?? 3002),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: ErrorService,
      useFactory: () => new ErrorService(ErrorSystem.API_MAIN),
    },
    AppService,
  ],
  exports: [CqrsModule, ErrorService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
