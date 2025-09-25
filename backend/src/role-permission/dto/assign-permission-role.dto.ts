import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignPermissionRoleDto {
    @ApiProperty({
        description: 'The ID of the permission to assign to the role',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    permissionId: string;

    @ApiProperty({
        description: 'The ID of the role to assign the permission to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    roleId: string;
}