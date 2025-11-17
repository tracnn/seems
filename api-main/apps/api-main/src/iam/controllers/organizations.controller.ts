import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';

/**
 * IAM Organizations Controller - API Gateway
 * Forwards requests to IAM Service via TCP
 */
@ApiTags('IAM - Organizations')
@Controller('api/v1/iam/organizations')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private readonly iamClient: IamClientService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organizations list' })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrganizations(@Query() filters?: any) {
    this.logger.log(`HTTP → Getting organizations list`);
    return await this.iamClient.getOrganizations(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrganizationById(@Param('id') id: string) {
    this.logger.log(`HTTP → Getting organization by ID: ${id}`);
    return await this.iamClient.getOrganizationById(id);
  }
}

