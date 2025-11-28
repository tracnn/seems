export class UpdateRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly name?: string,
    public readonly code?: string,
    public readonly description?: string,
    public readonly level?: number,
    public readonly updatedBy?: string,
  ) {}
}
