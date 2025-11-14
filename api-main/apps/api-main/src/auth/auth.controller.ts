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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ServiceEnum } from '@app/utils/service.enum';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dtos';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';
import { ActivateAccountDto } from './dtos/activate-account.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    @Inject(ServiceEnum.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Get('health')
  async healthCheck() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'health' }, {}),
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      example: {
        statusCode: 201,
        message: 'Đăng ký thành công',
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
    description: 'Username hoặc email đã tồn tại',
  })
  async register(@Body() registerDto: RegisterDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'register' }, registerDto),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        statusCode: 200,
        message: 'Đăng nhập thành công',
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
    description: 'Tên đăng nhập hoặc mật khẩu không đúng',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Request() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return firstValueFrom(
      this.authClient.send(
        { cmd: 'login' },
        {
          ...loginDto,
          ipAddress: ip,
          userAgent: userAgent || 'unknown',
        },
      ),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công',
    schema: {
      example: {
        statusCode: 200,
        message: 'Lấy thông tin người dùng thành công',
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
    description: 'Token không hợp lệ hoặc đã hết hạn',
  })
  async getMe(@Request() req: any) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'get-me' }, { userId: req.user.id }),
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiResponse({
    status: 200,
    description: 'Làm mới token thành công',
    schema: {
      example: {
        statusCode: 200,
        message: 'Làm mới token thành công',
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
    description: 'Refresh token không hợp lệ hoặc đã hết hạn',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ip: string,
    @Request() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return firstValueFrom(
      this.authClient.send(
        { cmd: 'refresh-token' },
        {
          ...refreshTokenDto,
          ipAddress: ip,
          userAgent: userAgent || 'unknown',
        },
      ),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
    schema: {
      example: {
        statusCode: 200,
        message: 'Đăng xuất thành công',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token không hợp lệ hoặc đã hết hạn',
  })
  async logout(@Request() req: any) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'logout' }, { userId: req.user.id }),
    );
  }

  @Post('activate-account')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('ADMIN') // Chỉ admin mới có quyền kích hoạt tài khoản
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kích hoạt tài khoản người dùng' })
  async activateAccount(@Body() dto: ActivateAccountDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'activate-account' }, dto),
    );
  }
}

