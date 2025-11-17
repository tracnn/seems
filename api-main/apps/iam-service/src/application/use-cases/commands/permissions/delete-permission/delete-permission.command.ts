export class DeletePermissionCommand {
  constructor(
    public readonly permissionId: string,
    public readonly deletedBy: string,
  ) {}
}

