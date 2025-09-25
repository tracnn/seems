import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteUserCommand {
    @IsString()
    @IsNotEmpty()
    id: string;

    constructor(id: string) {
        this.id = id;
    }
} 