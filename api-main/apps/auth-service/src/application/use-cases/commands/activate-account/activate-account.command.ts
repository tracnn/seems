export class ActivateAccountCommand {
    constructor(
      public readonly userId: string,
      public readonly activatedBy?: string, // ID của admin thực hiện hành động (optional)
    ) {}
}