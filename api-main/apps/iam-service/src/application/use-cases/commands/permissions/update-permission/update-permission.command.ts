export class UpdatePermissionCommand {
  constructor(
    public readonly permissionId: string,
    public readonly name?: string,
    public readonly code?: string,
    public readonly resource?: string,
    public readonly action?: string,
    public readonly description?: string,
    public readonly updatedBy?: string,
  ) {}
}

