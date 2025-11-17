import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { GetPermissionsQuery } from './get-permissions.query';
import type { IPermissionRepository } from '../../../../../domain/interfaces/permission.repository.interface';

@Injectable()
@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler implements IQueryHandler<GetPermissionsQuery> {
  private readonly logger = new Logger(GetPermissionsHandler.name);

  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(query: GetPermissionsQuery): Promise<any> {
    this.logger.log('Getting permissions list');
    
    const result = await this.permissionRepository.findAll();
    
    this.logger.log(`Found ${result.data.length} permissions`);
    return result.data; // Return array
  }
}

