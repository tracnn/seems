import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  ValidationPipe,
  Ip,
  Headers,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterDto } from '../../application/dtos/register.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RegisterCommand } from '../../application/use-cases/commands/register/register.command';
import { LoginCommand } from '../../application/use-cases/commands/login/login.command';
import { RefreshTokenCommand } from '../../application/use-cases/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from '../../application/use-cases/commands/logout/logout.command';
import { GetUserQuery } from '../../application/use-cases/queries/get-user/get-user.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    const command = new RegisterCommand(
      registerDto.username,
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
    );

    const user = await this.commandBus.execute(command);

    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Đăng ký thành công',
      data: userWithoutPassword,
    };
  }

  @MessagePattern({ cmd: 'login' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const command = new LoginCommand(
      loginDto.usernameOrEmail,
      loginDto.password,
      ip,
      userAgent,
    );

    const result = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  @MessagePattern({ cmd: 'get-me' })
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const query = new GetUserQuery(req.user.id);
    const user = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    };
  }

  @MessagePattern({ cmd: 'refresh-token' })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const command = new RefreshTokenCommand(
      refreshTokenDto.refreshToken,
      ip,
      userAgent,
    );

    const result = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Làm mới token thành công',
      data: result,
    };
  }

  @MessagePattern({ cmd: 'logout' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    const command = new LogoutCommand(req.user.id);

    await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng xuất thành công',
    };
  }
}

