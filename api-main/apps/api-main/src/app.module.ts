import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from '@app/utils';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [UtilsModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST ?? '0.0.0.0',
          port: Number(process.env.AUTH_SERVICE_PORT ?? 3001),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
