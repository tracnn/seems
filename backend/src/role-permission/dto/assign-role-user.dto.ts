import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class AssignRoleUserDto {
    @ApiProperty({
        description: 'The ID of the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNumber()
    userId: string;

    @ApiProperty({
        description: 'The ID of the role',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    roleId: string;
}