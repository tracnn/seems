import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetOrganizationByIdQuery } from './get-organization-by-id.query';
import type { IOrganizationRepository } from '../../../../../domain/interfaces/organization.repository.interface';

@Injectable()
@QueryHandler(GetOrganizationByIdQuery)
export class GetOrganizationByIdHandler implements IQueryHandler<GetOrganizationByIdQuery> {
  private readonly logger = new Logger(GetOrganizationByIdHandler.name);

  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(query: GetOrganizationByIdQuery): Promise<any> {
    this.logger.log(`Getting organization by ID: ${query.organizationId}`);
    
    const organization = await this.organizationRepository.findById(query.organizationId);
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${query.organizationId} not found`);
    }
    
    this.logger.log(`Organization found: ${organization.name}`);
    return organization;
  }
}

