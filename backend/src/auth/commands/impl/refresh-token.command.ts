import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenCommand {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
    }
} 