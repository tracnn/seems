export class AssignRolesCommand {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[],
    public readonly assignedBy: string,
    public readonly expiresAt?: string,
  ) {}
}

