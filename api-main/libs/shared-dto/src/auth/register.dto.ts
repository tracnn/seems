import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO for user registration
 * Sử dụng ở: API Gateway và Auth Service
 */
export class RegisterDto {
  @ApiProperty({ 
    description: 'Username', 
    example: 'john.doe',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString({ message: 'Username phải là chuỗi' })
  @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
  @MaxLength(100, { message: 'Username không được vượt quá 100 ký tự' })
  username: string;

  @ApiProperty({ 
    description: 'Email', 
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự' })
  email: string;

  @ApiProperty({ 
    description: 'Password', 
    example: 'password123',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString({ message: 'Password phải là chuỗi' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  @MaxLength(255, { message: 'Password không được vượt quá 255 ký tự' })
  password: string;

  @ApiPropertyOptional({ 
    description: 'First name', 
    example: 'John',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'First name phải là chuỗi' })
  @MaxLength(100, { message: 'First name không được vượt quá 100 ký tự' })
  firstName?: string;

  @ApiPropertyOptional({ 
    description: 'Last name', 
    example: 'Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Last name phải là chuỗi' })
  @MaxLength(100, { message: 'Last name không được vượt quá 100 ký tự' })
  lastName?: string;
}

