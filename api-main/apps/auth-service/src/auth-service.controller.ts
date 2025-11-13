import { Controller, Get } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { UtilsService } from '@app/utils';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService, private readonly utilsService: UtilsService) {}

  @Get()
  getHello(): string {
    return this.authServiceService.getHello() + ' ' + this.utilsService.sum(2, 2);
  }
}
