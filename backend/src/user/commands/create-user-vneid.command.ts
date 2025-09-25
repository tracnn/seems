import { CreateUserVneidDto } from "../dto/create-user-vneid.dto";
import { ICommand } from "@nestjs/cqrs";

export class CreateUserVneidCommand implements ICommand {
    constructor(
        public readonly createUserVneidDto: CreateUserVneidDto
    ) {}
}