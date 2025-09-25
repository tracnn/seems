import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        description: 'The name of the role',
        example: 'admin',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The display name of the role',
        example: 'Admin',
    })
    @IsNotEmpty()
    @IsString()
    displayName: string;

    @ApiProperty({
        description: 'The description of the role',
        example: 'Admin role',
    })
    @IsOptional()
    @IsString()
    description?: string;
}