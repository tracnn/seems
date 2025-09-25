import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, Matches, Length, IsNumber, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ERROR_400 } from '@common/error-messages/error-400';

export class CreateUserDto {
    @ApiProperty({
        description: 'Username',
        example: 'johndoe'
    })
    @IsString({ message: 'Username không hợp lệ' })
    @IsNotEmpty({ message: 'Username không được để trống' })
    @Matches(/^[a-zA-Z0-9_.]+$/, ERROR_400.USERNAME_NOT_VALID)
    username: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john.doe@example.com'
    })
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @ApiProperty({
        description: 'Password',
        example: 'password123'
    })
    @IsString({ message: 'Mật khẩu không hợp lệ' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;


    @ApiProperty({ example: 'Nguyễn Văn A', description: 'Full Name' })
    @IsString({ message: 'Tên không hợp lệ' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @Length(2, 100, { message: 'Tên phải có ít nhất 2 ký tự và tối đa 100 ký tự' })
    fullName: string;
} 
