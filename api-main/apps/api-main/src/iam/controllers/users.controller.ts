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
  HttpCode,
  HttpStatus,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserFilterDto } from '../dtos/user-filter.dto';
import { AssignRolesDto } from '../dtos/assign-roles.dto';

/**
 * IAM Users Controller - API Gateway
 * Forwards requests to IAM Service via TCP
 */
@ApiTags('IAM - Users')
@Controller('api/v1/iam/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly iamClient: IamClientService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createUser(@Body() dto: CreateUserDto, @Request() req: any) {
    this.logger.log(`HTTP → Creating user: ${dto.username}`);
    
    const currentUser = req.user;
    return await this.iamClient.createUser({
      ...dto,
      createdBy: currentUser?.id || 'api-gateway',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users list with pagination' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsers(@Query() filter: UserFilterDto) {
    this.logger.log(`HTTP → Getting users list, page: ${filter.page}, limit: ${filter.limit}`);
    return await this.iamClient.getUsers(filter);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserById(@Param('id') id: string) {
    this.logger.log(`HTTP → Getting user by ID: ${id}`);
    return await this.iamClient.getUserById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    this.logger.log(`HTTP → Updating user: ${id}`);
    
    const currentUser = req.user;
    return await this.iamClient.updateUser(id, dto, currentUser?.id || 'api-gateway');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`HTTP → Deleting user: ${id}`);
    
    const currentUser = req.user;
    return await this.iamClient.deleteUser(id, currentUser?.id || 'api-gateway');
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign roles to user' })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignRoles(
    @Param('id') userId: string,
    @Body() dto: AssignRolesDto,
    @Request() req: any,
  ) {
    this.logger.log(`HTTP → Assigning roles to user: ${userId}`);
    
    const currentUser = req.user;
    return await this.iamClient.assignRoles({
      userId,
      roleIds: dto.roleIds,
      assignedBy: currentUser?.id || 'api-gateway',
      expiresAt: dto.expiresAt,
    });
  }

  @Get(':id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'List of user permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPermissions(@Param('id') userId: string) {
    this.logger.log(`HTTP → Getting permissions for user: ${userId}`);
    return await this.iamClient.getUserPermissions(userId);
  }

  @Post(':id/organizations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign organizations to user' })
  @ApiResponse({ status: 200, description: 'Organizations assigned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignOrganizations(@Param('id') userId: string, @Body() dto: any) {
    this.logger.log(`HTTP → Assigning organizations to user: ${userId}`);
    return await this.iamClient.assignOrganizationsToUser(userId, dto.organizations);
  }

  @Delete(':id/organizations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove organizations from user' })
  @ApiResponse({ status: 200, description: 'Organizations removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeOrganizations(@Param('id') userId: string, @Body() dto: any) {
    this.logger.log(`HTTP → Removing organizations from user: ${userId}`);
    return await this.iamClient.removeOrganizationsFromUser(userId, dto.organizationIds);
  }
}

