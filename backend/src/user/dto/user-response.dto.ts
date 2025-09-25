import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
    @Expose()
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @Expose()
    @ApiProperty({
        description: 'Username',
        example: 'johndoe'
    })
    username: string;

    @Expose()
    @ApiProperty({
        description: 'Email address',
        example: 'john.doe@example.com'
    })
    email: string;


    @Expose()
    @ApiProperty({
        description: 'Account lock status',
        example: false
    })
    isLocked: boolean;


    @Expose()
    @ApiProperty({
        description: 'Full name',
        example: 'John Doe'
    })
    fullName: string;

    @Expose()
    @ApiProperty({
        description: 'Is Active',
        example: true
    })
    isActive: boolean;
} 