import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateUserCommand {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    password?: string;

    constructor(partial: Partial<UpdateUserCommand>) {
        Object.assign(this, partial);
    }
} 