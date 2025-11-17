import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceEnum } from '@app/utils/service.enum';
import { IamClientService } from './clients/iam-client.service';
import { UsersController } from './controllers/users.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { OrganizationsController } from './controllers/organizations.controller';

/**
 * IAM Module for API Gateway
 * Exposes HTTP endpoints and forwards to IAM Service via TCP
 */
@Module({
  imports: [
    // Register TCP client for IAM Service
    ClientsModule.registerAsync([
      {
        name: ServiceEnum.IAM_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('IAM_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('IAM_SERVICE_PORT') || 3003),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    UsersController,
    RolesController,
    PermissionsController,
    OrganizationsController,
  ],
  providers: [IamClientService],
  exports: [IamClientService],
})
export class IamModule {}

