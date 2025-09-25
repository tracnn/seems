export class UpdateUserActiveStatusCommand {
    constructor(
      public readonly userId: string, // hoặc kiểu number tùy DB
      public readonly isActive: boolean = true,
    ) {}
}