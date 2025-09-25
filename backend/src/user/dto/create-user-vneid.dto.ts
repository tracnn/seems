import { ApiProperty } from "@nestjs/swagger";

export class CreateUserVneidDto {
    @ApiProperty({
        description: 'Username',
        example: 'johndoe'
    })
    username: string;

    @ApiProperty({
        description: 'Password',
        example: 'password123'
    })
    password: string;

    @ApiProperty({
        description: 'Full Name',
        example: 'John Doe'
    })
    fullName: string;

    @ApiProperty({
        description: 'Birth Date',
        example: '1990-01-01'
    })
    birthDate: string;

    @ApiProperty({
        description: 'Identity Number',
        example: '1234567890'
    })
    identityNumber: string;

    @ApiProperty({
        description: 'Is Incomplete',
        example: 1
    })
    isIncomplete: number;

    @ApiProperty({
        description: 'Account Type',
        example: 0
    })
    accountType: number;

    @ApiProperty({
        description: 'Account Level',
        example: 0
    })
    accountLevel: number;
}