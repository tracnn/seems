import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { GetRolesQuery } from './get-roles.query';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';

@Injectable()
@QueryHandler(GetRolesQuery)
export class GetRolesHandler implements IQueryHandler<GetRolesQuery> {
  private readonly logger = new Logger(GetRolesHandler.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: GetRolesQuery): Promise<any> {
    this.logger.log('Getting roles list');
    
    const result = await this.roleRepository.findAll();
    
    this.logger.log(`Found ${result.data.length} roles (total: ${result.total})`);
    return result.data; // Return array of roles
  }
}

