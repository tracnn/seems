import { GetUsersDto } from '../../../../dtos/user/get-users.dto';

export class GetUsersQuery {
  constructor(public readonly dto: GetUsersDto) {}
}

