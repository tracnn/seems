import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { Injectable } from '@nestjs/common';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { ErrorCode } from '@app/shared-constants';
import { BaseException } from '@app/shared-exceptions';

@Injectable()
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly iamClient: IamClientService) {}

  async execute(query: GetUserQuery): Promise<any> {
    const { userId } = query;

    const user = await this.iamClient.getUserById(userId);
    if (!user) {
      throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0002, { userId });
    }

    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

