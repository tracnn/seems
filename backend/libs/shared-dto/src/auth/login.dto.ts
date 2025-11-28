import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for user login
 * Sử dụng ở: API Gateway và Auth Service
 */
export class LoginDto {
  @ApiProperty({
    description: 'Username hoặc email',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Username hoặc email không được để trống' })
  @IsString({ message: 'Username hoặc email phải là chuỗi' })
  usernameOrEmail: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString({ message: 'Password phải là chuỗi' })
  password: string;
}
