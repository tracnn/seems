export class AssignOrganizationsCommand {
  constructor(
    public readonly userId: string,
    public readonly organizations: Array<{
      organizationId: string;
      role?: string;
      isPrimary?: boolean;
    }>,
  ) {}
}

