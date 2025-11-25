import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { Injectable } from '@nestjs/common';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { ErrorService } from '@app/shared-exceptions';
import { AuthServiceErrorCodes } from '@app/shared-constants';

@Injectable()
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    private readonly errorService: ErrorService,
    private readonly iamClient: IamClientService,
  ) {}

  async execute(query: GetUserQuery): Promise<any> {
    const { userId } = query;

    const user = await this.iamClient.getUserById(userId);
    if (!user) {
      this.errorService.throw(AuthServiceErrorCodes.USER_NOT_FOUND, { userId });
    }

    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
