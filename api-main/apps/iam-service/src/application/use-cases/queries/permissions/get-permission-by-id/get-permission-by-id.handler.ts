import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetPermissionByIdQuery } from './get-permission-by-id.query';
import type { IPermissionRepository } from '../../../../../domain/interfaces/permission.repository.interface';

@Injectable()
@QueryHandler(GetPermissionByIdQuery)
export class GetPermissionByIdHandler implements IQueryHandler<GetPermissionByIdQuery> {
  private readonly logger = new Logger(GetPermissionByIdHandler.name);

  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(query: GetPermissionByIdQuery): Promise<any> {
    this.logger.log(`Getting permission by ID: ${query.permissionId}`);
    
    const permission = await this.permissionRepository.findById(query.permissionId);
    
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${query.permissionId} not found`);
    }
    
    this.logger.log(`Permission found: ${permission.name}`);
    return permission;
  }
}

