import { Controller, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from '../../application/use-cases/commands/login/login.command';
import { RefreshTokenCommand } from '../../application/use-cases/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from '../../application/use-cases/commands/logout/logout.command';
import { GetUserQuery } from '../../application/use-cases/queries/get-user/get-user.query';
import { MessagePattern } from '@nestjs/microservices';
import { ServiceName } from '@app/shared-constants';

@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'login' })
  async login(data: any) {
    // Data từ TCP message pattern bao gồm: usernameOrEmail, password, ipAddress, userAgent
    const command = new LoginCommand(
      data.usernameOrEmail,
      data.password,
      data.ipAddress,
      data.userAgent,
    );

    const result = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  @MessagePattern({ cmd: 'get-me' })
  async getMe(data: any) {
    const query = new GetUserQuery(data.userId);
    const user = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    };
  }

  @MessagePattern({ cmd: 'refresh-token' })
  async refreshToken(data: any) {
    // Data từ TCP message pattern bao gồm: refreshToken, ipAddress, userAgent
    const command = new RefreshTokenCommand(
      data.refreshToken,
      data.ipAddress,
      data.userAgent,
    );

    const result = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Làm mới token thành công',
      data: result,
    };
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(data: any) {
    const command = new LogoutCommand(data.userId);

    await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng xuất thành công',
    };
  }

  @MessagePattern({ cmd: 'health' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: ServiceName.AUTH_SERVICE,
      uptime: process.uptime(),
    };
  }
}

