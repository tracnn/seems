export class CreateRoleCommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly description?: string,
    public readonly level?: number,
    public readonly createdBy?: string,
  ) {}
}

