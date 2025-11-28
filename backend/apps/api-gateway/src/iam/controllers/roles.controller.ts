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
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
} from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';

class CreateRoleDto {
  @ApiProperty({ example: 'Administrator', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Role code (unique identifier)',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'Administrator role with full access',
    description: 'Role description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 90,
    description: 'Role level (0-100)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  level?: number;
}

class UpdateRoleDto {
  @ApiProperty({
    example: 'Senior Administrator',
    description: 'Role name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'SENIOR_ADMIN',
    description: 'Role code',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Role description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 95, description: 'Role level', required: false })
  @IsNumber()
  @IsOptional()
  level?: number;
}

class AssignPermissionsDto {
  @ApiProperty({
    example: ['perm-uuid-1', 'perm-uuid-2'],
    description: 'Array of permission IDs',
  })
  @IsArray()
  @IsNotEmpty()
  permissionIds: string[];
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
  @ApiOperation({ summary: 'Get roles list with pagination' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRoles(@Query('page') page?: number, @Query('limit') limit?: number) {
    this.logger.log(
      `HTTP → Getting roles list (page: ${page}, limit: ${limit})`,
    );
    return await this.iamClient.getRoles({ page, limit });
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Request() req: any,
  ) {
    this.logger.log(`HTTP → Updating role: ${id}`);

    const currentUser = req.user;
    return await this.iamClient.updateRole(id, {
      ...dto,
      updatedBy: currentUser?.id || 'api-gateway',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete role (soft delete)' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteRole(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`HTTP → Deleting role: ${id}`);

    const currentUser = req.user;
    return await this.iamClient.deleteRole(
      id,
      currentUser?.id || 'api-gateway',
    );
  }

  @Post(':id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
    @Request() req: any,
  ) {
    this.logger.log(
      `HTTP → Assigning ${dto.permissionIds.length} permissions to role: ${id}`,
    );

    const currentUser = req.user;
    return await this.iamClient.assignPermissionsToRole(
      id,
      dto.permissionIds,
      currentUser?.id,
    );
  }

  @Delete(':id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove permissions from role' })
  @ApiResponse({ status: 200, description: 'Permissions removed successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removePermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    this.logger.log(
      `HTTP → Removing ${dto.permissionIds.length} permissions from role: ${id}`,
    );

    return await this.iamClient.removePermissionsFromRole(
      id,
      dto.permissionIds,
    );
  }
}
