export class RemoveOrganizationsCommand {
  constructor(
    public readonly userId: string,
    public readonly organizationIds: string[],
  ) {}
}

