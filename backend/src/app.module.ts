import 'dotenv/config';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerOptions } from './common/winston.config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createTypeOrmConfig } from './configs/typeorm.config';
import { HttpModule } from '@nestjs/axios';
import { OrganizationConfigService } from './common/organization-config.service';
import { Qd3176Module } from './bhxh/qd3176/qd3176.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MeilisearchModule } from './meilisearch/meilisearch.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { BullModule } from '@nestjs/bull';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'), // Luôn chính xác ở Node 22
    }),
    MeilisearchModule.forRootAsync(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => createTypeOrmConfig(configService),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
          redis: {
              host: configService.get('REDIS__URL') || 'localhost',
              port: parseInt(configService.get('REDIS_PORT') || '6379'),
              password: configService.get('REDIS_PASSWORD') || '',
              //username: configService.get('REDIS_SERVER_USERNAME') || '',
          },
      }),
      inject: [ConfigService],
    }),
    CqrsModule,
    WinstonModule.forRoot(createWinstonLoggerOptions()),
    HttpModule,
    Qd3176Module,
    ScheduleModule.forRoot(),
    MeilisearchModule,
    RolePermissionModule,
    UserModule,
    AuthModule,
    RedisModule,
    SseModule,
  ],
  controllers: [AppController],
  providers: [AppService, OrganizationConfigService],
  exports: [OrganizationConfigService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
