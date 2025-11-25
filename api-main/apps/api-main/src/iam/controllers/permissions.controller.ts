import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';

class CreatePermissionDto {
  @ApiProperty({ example: 'Create Patient', description: 'Permission name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'PATIENT_CREATE',
    description: 'Permission code (unique)',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'patient',
    description: 'Resource name',
    required: false,
  })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiProperty({
    example: 'create',
    description: 'Action name',
    required: false,
  })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({
    example: 'Permission to create patient records',
    description: 'Description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

class UpdatePermissionDto {
  @ApiProperty({ example: 'Updated Permission Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'UPDATED_CODE', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'updated-resource', required: false })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiProperty({ example: 'updated-action', required: false })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * IAM Permissions Controller - API Gateway
 * Forwards requests to IAM Service via TCP
 */
@ApiTags('IAM - Permissions')
@Controller('api/v1/iam/permissions')
export class PermissionsController {
  private readonly logger = new Logger(PermissionsController.name);

  constructor(private readonly iamClient: IamClientService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPermission(
    @Body() dto: CreatePermissionDto,
    @Request() req: any,
  ) {
    this.logger.log(`HTTP → Creating permission: ${dto.name}`);

    const currentUser = req.user;
    return await this.iamClient.createPermission({
      ...dto,
      createdBy: currentUser?.id || 'api-gateway',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permissions list with pagination' })
  @ApiResponse({ status: 200, description: 'List of permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPermissions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`HTTP → Getting permissions list`);
    return await this.iamClient.getPermissions({ page, limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission details' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPermissionById(@Param('id') id: string) {
    this.logger.log(`HTTP → Getting permission by ID: ${id}`);
    return await this.iamClient.getPermissionById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePermission(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
    @Request() req: any,
  ) {
    this.logger.log(`HTTP → Updating permission: ${id}`);

    const currentUser = req.user;
    return await this.iamClient.updatePermission(id, {
      ...dto,
      updatedBy: currentUser?.id || 'api-gateway',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete permission (soft delete)' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deletePermission(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`HTTP → Deleting permission: ${id}`);

    const currentUser = req.user;
    return await this.iamClient.deletePermission(
      id,
      currentUser?.id || 'api-gateway',
    );
  }
}
