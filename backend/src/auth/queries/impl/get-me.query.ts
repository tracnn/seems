import { IsString, IsNotEmpty } from 'class-validator';

export class GetMeQuery {
    @IsString()
    @IsNotEmpty()
    userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }
} 