export class CreatePermissionCommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly resource?: string,
    public readonly action?: string,
    public readonly description?: string,
    public readonly createdBy?: string,
  ) {}
}

