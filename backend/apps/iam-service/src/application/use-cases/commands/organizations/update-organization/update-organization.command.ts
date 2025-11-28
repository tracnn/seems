export class UpdateOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly name?: string,
    public readonly code?: string,
    public readonly type?: string,
    public readonly parentId?: string,
    public readonly address?: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly website?: string,
    public readonly isActive?: boolean,
    public readonly updatedBy?: string,
  ) {}
}
