import { UserFilterDto } from '../../../../dtos/user/user-filter.dto';

export class GetUsersQuery {
  constructor(public readonly filter: UserFilterDto) {}
}

