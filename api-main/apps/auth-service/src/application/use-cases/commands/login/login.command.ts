export class LoginCommand {
  constructor(
    public readonly usernameOrEmail: string,
    public readonly password: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}

