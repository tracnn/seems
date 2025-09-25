import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class AssignPermissionUserDto {
    @ApiProperty({
        description: 'The ID of the user',
        example: 1,
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: 'The ID of the permission',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    permissionId: string;
}