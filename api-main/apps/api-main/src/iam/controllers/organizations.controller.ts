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
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';

class CreateOrganizationDto {
  @ApiProperty({ example: 'Hospital A', description: 'Organization name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'HOSP_A', description: 'Organization code (unique)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'hospital',
    description: 'Organization type',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    example: 'parent-org-uuid',
    description: 'Parent organization ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    example: '123 Main Street, City',
    description: 'Address',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: '+84123456789',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'contact@hospital.com',
    description: 'Email',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'https://hospital.com',
    description: 'Website',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;
}

class UpdateOrganizationDto {
  @ApiProperty({ example: 'Updated Hospital Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'UPDATED_CODE', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'clinic', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'new-parent-uuid', required: false })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ example: '456 New Street', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+84987654321', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'newemail@hospital.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://newhospital.com', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * IAM Organizations Controller - API Gateway
 * Forwards requests to IAM Service via TCP
 */
@ApiTags('IAM - Organizations')
@Controller('api/v1/iam/organizations')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private readonly iamClient: IamClientService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @Request() req: any,
  ) {
    this.logger.log(`HTTP → Creating organization: ${dto.name}`);

    const currentUser = req.user;
    return await this.iamClient.createOrganization({
      ...dto,
      createdBy: currentUser?.id || 'api-gateway',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organizations list with pagination' })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrganizations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`HTTP → Getting organizations list`);
    return await this.iamClient.getOrganizations({ page, limit });
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateOrganization(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @Request() req: any,
  ) {
    this.logger.log(`HTTP → Updating organization: ${id}`);

    const currentUser = req.user;
    return await this.iamClient.updateOrganization(id, {
      ...dto,
      updatedBy: currentUser?.id || 'api-gateway',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete organization (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Organization deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteOrganization(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`HTTP → Deleting organization: ${id}`);

    const currentUser = req.user;
    return await this.iamClient.deleteOrganization(
      id,
      currentUser?.id || 'api-gateway',
    );
  }
}
