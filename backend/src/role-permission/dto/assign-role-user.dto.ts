import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class AssignRoleUserDto {
    @ApiProperty({
        description: 'The ID of the user',
        example: 1,
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: 'The ID of the role',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    roleId: string;
}