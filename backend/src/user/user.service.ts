import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryBus } from '@nestjs/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { GetUsersDto } from './dto/get-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<any> {       
    }

    async findAll(query: GetUsersDto) {
        return [];
    }

    async findOne(id: string) {
        return [];
    }


    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        return [];
    }

    async deleteUser(userId: string) {
        return [];
    }
}
