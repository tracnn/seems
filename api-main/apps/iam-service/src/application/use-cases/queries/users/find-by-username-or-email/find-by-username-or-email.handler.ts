import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { FindByUsernameOrEmailQuery } from './find-by-username-or-email.query';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import { User } from '../../../../../domain/entities/user.entity';

@QueryHandler(FindByUsernameOrEmailQuery)
export class FindByUsernameOrEmailHandler implements IQueryHandler<FindByUsernameOrEmailQuery> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: FindByUsernameOrEmailQuery): Promise<User> {
    const user = await this.userRepository.findByUsernameOrEmail(query.usernameOrEmail, query.usernameOrEmail);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

