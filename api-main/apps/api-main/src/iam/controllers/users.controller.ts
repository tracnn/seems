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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IamClientService } from '../clients/iam-client.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AssignRolesDto } from '../dtos/assign-roles.dto';
import { RegisterDto, ActivateAccountDto } from '@app/shared-dto';
import { convertRpcError } from '@app/shared-exceptions';
import { GetUsersDto } from '../dtos/get-users.dto';

/**
 * IAM Users Controller - API Gateway
 * Forwards requests to IAM Service via TCP
 */
@ApiTags('IAM - Users')
@Controller('api/v1/iam/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly iamClient: IamClientService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'Register successfully',
    schema: {
      example: {
        statusCode: 201,
        message: 'Register successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'john.doe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: 1,
          isEmailVerified: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Username or email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);

    try {
      const result = await this.iamClient.register(registerDto);

      this.logger.log(`User registered successfully: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Registration failed for ${registerDto.email}: ${error.message}`,
        error.stack,
      );
      throw convertRpcError(error);
    }
  }

  @Post('activate-account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async activateAccount(@Body() dto: ActivateAccountDto) {
    try {
      return await this.iamClient.activateAccount(dto);
    } catch (error) {
      throw convertRpcError(error);
    }
  }

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
  async getUsers(@Query() query: GetUsersDto) {
    this.logger.log(
      `HTTP → Getting users list, page: ${query.page}, limit: ${query.limit}`,
    );
    return await this.iamClient.getUsers(query);
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
    return await this.iamClient.updateUser(
      id,
      dto,
      currentUser?.id || 'api-gateway',
    );
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
    return await this.iamClient.deleteUser(
      id,
      currentUser?.id || 'api-gateway',
    );
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
  @ApiResponse({
    status: 200,
    description: 'Organizations assigned successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignOrganizations(@Param('id') userId: string, @Body() dto: any) {
    this.logger.log(`HTTP → Assigning organizations to user: ${userId}`);
    return await this.iamClient.assignOrganizationsToUser(
      userId,
      dto.organizations,
    );
  }

  @Delete(':id/organizations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove organizations from user' })
  @ApiResponse({
    status: 200,
    description: 'Organizations removed successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeOrganizations(@Param('id') userId: string, @Body() dto: any) {
    this.logger.log(`HTTP → Removing organizations from user: ${userId}`);
    return await this.iamClient.removeOrganizationsFromUser(
      userId,
      dto.organizationIds,
    );
  }
}
