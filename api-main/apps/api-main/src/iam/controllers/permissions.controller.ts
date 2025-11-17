import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';

/**
 * IAM Permissions Controller - API Gateway
 * Forwards requests to IAM Service via TCP
 */
@ApiTags('IAM - Permissions')
@Controller('api/v1/iam/permissions')
export class PermissionsController {
  private readonly logger = new Logger(PermissionsController.name);

  constructor(private readonly iamClient: IamClientService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permissions list' })
  @ApiResponse({ status: 200, description: 'List of permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPermissions(@Query() filters?: any) {
    this.logger.log(`HTTP → Getting permissions list`);
    return await this.iamClient.getPermissions(filters);
  }
}

