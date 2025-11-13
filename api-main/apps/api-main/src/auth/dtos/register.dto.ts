import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Username', example: 'john.doe' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString({ message: 'Username phải là chuỗi' })
  @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
  @MaxLength(100, { message: 'Username không được vượt quá 100 ký tự' })
  username: string;

  @ApiProperty({ description: 'Email', example: 'john.doe@example.com' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự' })
  email: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString({ message: 'Password phải là chuỗi' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  @MaxLength(255, { message: 'Password không được vượt quá 255 ký tự' })
  password: string;

  @ApiProperty({ description: 'First name', example: 'John', required: false })
  @IsOptional()
  @IsString({ message: 'First name phải là chuỗi' })
  @MaxLength(100, { message: 'First name không được vượt quá 100 ký tự' })
  firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', required: false })
  @IsOptional()
  @IsString({ message: 'Last name phải là chuỗi' })
  @MaxLength(100, { message: 'Last name không được vượt quá 100 ký tự' })
  lastName?: string;
}

