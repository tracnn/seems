import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from './get-users.query';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import { User } from '../../../../../domain/entities/user.entity';
import { PaginationResponseDto } from '@app/shared-dto';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<any> {
    const result = await this.userRepository.findAll(query.dto);

    return result;
  }
}

