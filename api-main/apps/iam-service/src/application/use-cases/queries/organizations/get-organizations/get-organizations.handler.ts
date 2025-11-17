import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { GetOrganizationsQuery } from './get-organizations.query';
import type { IOrganizationRepository } from '../../../../../domain/interfaces/organization.repository.interface';

@Injectable()
@QueryHandler(GetOrganizationsQuery)
export class GetOrganizationsHandler implements IQueryHandler<GetOrganizationsQuery> {
  private readonly logger = new Logger(GetOrganizationsHandler.name);

  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(query: GetOrganizationsQuery): Promise<any> {
    this.logger.log('Getting organizations list');
    
    const result = await this.organizationRepository.findAll();
    
    this.logger.log(`Found ${result.data.length} organizations`);
    return result.data; // Return array
  }
}

