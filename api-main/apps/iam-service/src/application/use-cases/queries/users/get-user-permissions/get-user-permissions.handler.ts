import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserPermissionsQuery } from './get-user-permissions.query';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';

@QueryHandler(GetUserPermissionsQuery)
export class GetUserPermissionsHandler
  implements IQueryHandler<GetUserPermissionsQuery>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserPermissionsQuery): Promise<string[]> {
    const user = await this.userRepository.findByIdWithPermissions(
      query.userId,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Aggregate permissions from all roles
    const permissions = new Set<string>();

    user.userRoles?.forEach((userRole) => {
      // Check if role assignment is not expired
      if (userRole.expiresAt && new Date(userRole.expiresAt) < new Date()) {
        return; // Skip expired roles
      }

      userRole.role?.rolePermissions?.forEach((rolePermission) => {
        if (rolePermission.permission?.code) {
          permissions.add(rolePermission.permission.code);
        }
      });
    });

    return Array.from(permissions);
  }
}
