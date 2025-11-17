import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetRoleByIdQuery } from './get-role-by-id.query';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';

@Injectable()
@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler implements IQueryHandler<GetRoleByIdQuery> {
  private readonly logger = new Logger(GetRoleByIdHandler.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: GetRoleByIdQuery): Promise<any> {
    this.logger.log(`Getting role by ID: ${query.roleId}`);
    
    const role = await this.roleRepository.findById(query.roleId);
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${query.roleId} not found`);
    }
    
    this.logger.log(`Role found: ${role.name}`);
    return role;
  }
}

