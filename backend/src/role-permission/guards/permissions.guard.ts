import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PermissionService } from "../services/permission.service";
import { PERMISSION_KEY } from "../decorators/permission.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler());
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.userId) return false;

    const permissions = await this.permissionService.getAllPermissions(user.userId);
    return requiredPermissions.every(p => permissions.includes(p));
  }
}