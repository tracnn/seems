import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';

class CreateRoleDto {
  @ApiProperty({ example: 'Administrator', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ADMIN', description: 'Role code (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Administrator role with full access', description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 90, description: 'Role level (0-100)', required: false })
  @IsOptional()
  level?: number;
}

/**
 * IAM Roles Controller - API Gateway
 * Forwards requests to IAM Service via TCP
 */
@ApiTags('IAM - Roles')
@Controller('api/v1/iam/roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly iamClient: IamClientService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createRole(@Body() dto: CreateRoleDto, @Request() req: any) {
    this.logger.log(`HTTP → Creating role: ${dto.name}`);
    
    const currentUser = req.user;
    return await this.iamClient.createRole({
      ...dto,
      createdBy: currentUser?.id || 'api-gateway',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get roles list' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRoles(@Query() filters?: any) {
    this.logger.log(`HTTP → Getting roles list`);
    return await this.iamClient.getRoles(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRoleById(@Param('id') id: string) {
    this.logger.log(`HTTP → Getting role by ID: ${id}`);
    return await this.iamClient.getRoleById(id);
  }
}

