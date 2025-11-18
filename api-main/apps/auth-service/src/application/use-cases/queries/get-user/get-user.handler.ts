import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { ErrorCode, ERROR_MESSAGES } from '@app/shared-constants';

@Injectable()
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly iamClient: IamClientService) {}

  async execute(query: GetUserQuery): Promise<any> {
    const { userId } = query;

    const user = await this.iamClient.getUserById(userId);
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: ERROR_MESSAGES[ErrorCode.USER_NOT_FOUND],
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

