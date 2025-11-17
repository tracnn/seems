import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from './get-users.query';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import { User } from '../../../../../domain/entities/user.entity';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const result = await this.userRepository.findAll({
      page: query.filter.page,
      limit: query.filter.limit,
      search: query.filter.search,
      isActive: query.filter.isActive,
    });

    return {
      ...result,
      page: query.filter.page || 1,
      limit: query.filter.limit || 10,
    };
  }
}

