export class DeleteUserCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string,
  ) {}
}

