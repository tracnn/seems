import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PermissionType } from '../enums/permission.enum';

export class CreatePermissionDto {
    @ApiProperty({
        description: 'The name of the permission',
        example: 'create-user',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The display name of the permission',
        example: 'Create User',
    })
    @IsNotEmpty()
    @IsString()
    displayName: string;
  
    @ApiProperty({
        description: 'The description of the permission',
        example: 'Create a new user',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'The type of the permission',
        enum: PermissionType,
        example: PermissionType.API,
    })
    @IsNotEmpty()
    @IsEnum(PermissionType)
    type: PermissionType;
}