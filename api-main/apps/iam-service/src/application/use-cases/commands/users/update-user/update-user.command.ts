import { UpdateUserDto } from '../../../../dtos/user/update-user.dto';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdateUserDto,
    public readonly updatedBy: string,
  ) {}
}

