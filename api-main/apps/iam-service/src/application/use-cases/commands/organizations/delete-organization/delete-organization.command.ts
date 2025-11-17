export class DeleteOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly deletedBy: string,
  ) {}
}

