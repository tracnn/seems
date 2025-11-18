import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  Headers,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ServiceName } from '@app/shared-constants';
import { RegisterDto, LoginDto, RefreshTokenDto, ActivateAccountDto } from '@app/shared-dto';
import { JwtAuthGuard } from '@app/shared-guards';
import { convertRpcError } from '@app/shared-exceptions';
import { firstValueFrom } from 'rxjs';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    @Inject(ServiceName.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {
  }

  @Get('health')
  async healthCheck() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'health' }, {}),
    );
  }

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
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'register' }, registerDto),
      );
      
      this.logger.log(`User registered successfully: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Registration failed for ${registerDto.email}: ${error.message}`,
        error.stack,
      );
      // Chuyển đổi RPC error thành RpcException để exception filter xử lý đúng
      throw convertRpcError(error);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Login successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 900,
          tokenType: 'Bearer',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'john.doe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Username or password is incorrect',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Request() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    try {
      const result = await firstValueFrom(
        this.authClient.send(
          { cmd: 'login' },
          {
            ...loginDto,
            ipAddress: ip,
            userAgent: userAgent || 'unknown',
          },
        ),
      );
      
      return result;
    } catch (error) {
      // Chuyển đổi RPC error thành RpcException để exception filter xử lý đúng
      throw convertRpcError(error);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Get user information successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Get user information successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'john.doe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: 1,
          isEmailVerified: 0,
          lastLoginAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token is invalid or expired',
  })
  async getMe(@Request() req: any) {
    this.logger.debug(`Get user profile: ${req.user.id}`);
    
    try {
      return await firstValueFrom(
        this.authClient.send({ cmd: 'get-me' }, { userId: req.user.id }),
      );
    } catch (error) {
      // Chuyển đổi RPC error thành RpcException để exception filter xử lý đúng
      throw convertRpcError(error);
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Refresh token successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Refresh token successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 900,
          tokenType: 'Bearer',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'john.doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token is invalid or expired',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ip: string,
    @Request() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    try {
      return await firstValueFrom(
        this.authClient.send(
          { cmd: 'refresh-token' },
          {
            ...refreshTokenDto,
            ipAddress: ip,
            userAgent: userAgent || 'unknown',
          },
        ),
      );
    } catch (error) {
      // Chuyển đổi RPC error thành RpcException để exception filter xử lý đúng
      throw convertRpcError(error);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Logout successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token is invalid or expired',
  })
  async logout(@Request() req: any) {
    this.logger.log('LOGOUT', req.user.id);
    
    try {
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'logout' }, { userId: req.user.id }),
      );
      
      this.logger.log(`User logged out: ${req.user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Logout failed for user ${req.user.id}`, error.stack);
      // Chuyển đổi RPC error thành RpcException để exception filter xử lý đúng
      throw convertRpcError(error);
    }
  }

  @Post('activate-account')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('ADMIN') // Chỉ admin mới có quyền kích hoạt tài khoản
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user account' })
  async activateAccount(@Body() dto: ActivateAccountDto) {
    try {
      return await firstValueFrom(
        this.authClient.send({ cmd: 'activate-account' }, dto),
      );
    } catch (error) {
      // Chuyển đổi RPC error thành RpcException để exception filter xử lý đúng
      throw convertRpcError(error);
    }
  }
}

