import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserCommand {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    constructor(partial: Partial<CreateUserCommand>) {
        Object.assign(this, partial);
    }
} 