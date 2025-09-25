import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginCommand {
    @ApiProperty({
        description: 'Username, National Identity Card (12 digits), or Social Insurance Code (10 digits)',
        example: 'sa',
        examples: ['johndoe', '123456789012', '1234567890']
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'User password',
        example: 'password123'
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'User agent string',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        required: false
    })
    @IsString()
    @IsOptional()
    userAgent?: string;

    constructor(partial: Partial<LoginCommand>) {
        Object.assign(this, partial);
    }
} 